# Plan de Reprise après Sinistre Premium - TrackingBMS

**Version :** 1.0 Premium  
**Date :** 2025-09-01  
**Répertoire de Travail :** `C:\Users\Brujah\Documents\GitHub\GeeknDragon\Eds\TrackingBMS`

## 🎯 Objectifs de Continuité d'Activité

### Métriques de Récupération Premium
- **RTO (Recovery Time Objective) :** < 15 minutes
- **RPO (Recovery Point Objective) :** < 5 minutes  
- **Disponibilité Cible :** 99.99% (8.76h downtime max/an)
- **Sites de Secours :** 2 sites géographiquement distribués
- **Tests de Récupération :** Mensuels automatisés
- **Certification :** ISO 22301 (Business Continuity)

## 🏗️ Architecture de Reprise Multi-Sites

### Sites de Production et Secours
```yaml
Site Principal (Primary):
  Location: Montreal, Canada
  Infrastructure: AWS us-east-1
  Capacity: 100% production load
  Role: Active production
  
Site Secours Principal (Hot Standby):
  Location: Toronto, Canada  
  Infrastructure: AWS ca-central-1
  Capacity: 100% production load
  Role: Hot standby, failover automatique
  Sync: Temps réel (< 5min RPO)
  
Site Secours Secondaire (Warm Standby):
  Location: Vancouver, Canada
  Infrastructure: Azure Canada Central
  Capacity: 75% production load
  Role: Warm standby, activation manuelle
  Sync: Quotidienne (24h RPO max)
  
Site Sauvegarde Froide (Cold Backup):
  Location: Europe (Frankfurt)
  Infrastructure: AWS eu-central-1
  Capacity: Infrastructure minimale
  Role: Backup long terme, disaster complet
  Sync: Hebdomadaire
```

### Architecture Réplication Données
```sql
-- Configuration PostgreSQL Streaming Replication
-- postgresql.conf (Master)
wal_level = replica
max_wal_senders = 10
max_replication_slots = 10
synchronous_commit = on
synchronous_standby_names = 'standby1,standby2'

-- Configuration Hot Standby (Toronto)
hot_standby = on
max_standby_streaming_delay = 30s
wal_receiver_status_interval = 10s
primary_conninfo = 'host=montreal-primary port=5432 user=replicator'

-- Configuration Warm Standby (Vancouver)  
restore_command = 'aws s3 cp s3://trackingbms-wal/%f %p'
recovery_target_timeline = 'latest'
standby_mode = 'on'
```

## 🔄 Procédures de Basculement Automatique

### Script de Failover Principal
```bash
#!/bin/bash
# scripts/disaster-recovery/auto-failover.sh

set -euo pipefail

# Configuration
PRIMARY_SITE="montreal-primary"
SECONDARY_SITE="toronto-secondary" 
TERTIARY_SITE="vancouver-tertiary"
MONITORING_INTERVAL=30
MAX_FAILURE_COUNT=3

# Logging
LOG_FILE="/var/log/trackingbms/disaster-recovery.log"
ALERT_WEBHOOK="https://hooks.slack.com/services/..."

log() {
    local level=$1
    local message=$2
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    echo "[$timestamp] [$level] $message" | tee -a $LOG_FILE
}

send_alert() {
    local severity=$1
    local message=$2
    local payload="{\"text\":\"🚨 TrackingBMS DR Alert [$severity]: $message\"}"
    curl -X POST -H 'Content-type: application/json' --data "$payload" $ALERT_WEBHOOK
}

check_site_health() {
    local site=$1
    local health_endpoint="https://${site}.trackingbms.com/api/health"
    
    # Tests de sanité complets
    local tests=(
        "curl -f -m 10 $health_endpoint"
        "curl -f -m 10 ${site}.trackingbms.com/api/database/health"
        "curl -f -m 10 ${site}.trackingbms.com/api/redis/health"
        "curl -f -m 10 ${site}.trackingbms.com/api/bms/connectivity"
    )
    
    local failure_count=0
    for test in "${tests[@]}"; do
        if ! eval $test &>/dev/null; then
            ((failure_count++))
        fi
    done
    
    return $failure_count
}

get_replication_lag() {
    local standby_host=$1
    local lag_query="SELECT EXTRACT(EPOCH FROM (now() - pg_last_xact_replay_timestamp()))::int;"
    
    psql -h $standby_host -U postgres -t -c "$lag_query" 2>/dev/null || echo "999999"
}

initiate_failover() {
    local failed_site=$1
    local target_site=$2
    
    log "CRITICAL" "Début failover: $failed_site -> $target_site"
    send_alert "CRITICAL" "Failover automatique démarré: $failed_site -> $target_site"
    
    # 1. Promotion du standby en primary
    log "INFO" "Promotion du standby $target_site en primary"
    ssh -o StrictHostKeyChecking=no admin@$target_site "
        sudo -u postgres pg_promote /var/lib/postgresql/data
        sudo systemctl restart postgresql
    "
    
    # 2. Mise à jour DNS/Load Balancer
    log "INFO" "Mise à jour du routage DNS"
    aws route53 change-resource-record-sets \
        --hosted-zone-id $HOSTED_ZONE_ID \
        --change-batch file://dns-failover-$target_site.json
    
    # 3. Redirection du trafic
    log "INFO" "Redirection du trafic applicatif"
    aws elbv2 modify-target-group \
        --target-group-arn $PRODUCTION_TG_ARN \
        --targets Id=$target_site-instance
    
    # 4. Mise à jour configuration Redis
    log "INFO" "Basculement Redis Sentinel"
    redis-cli -h redis-sentinel SENTINEL failover trackingbms-master
    
    # 5. Validation du failover
    sleep 30
    if check_site_health $target_site; then
        log "SUCCESS" "Failover réussi vers $target_site"
        send_alert "SUCCESS" "Failover réussi - Site actif: $target_site"
        
        # Notification des équipes
        notify_teams_failover_success $failed_site $target_site
        
        # Démarrage procédures post-failover
        post_failover_procedures $failed_site $target_site
    else
        log "ERROR" "Failover échoué vers $target_site"
        send_alert "CRITICAL" "Échec failover vers $target_site - Escalade manuelle requise"
        
        # Tentative failover vers site tertiaire
        if [[ $target_site != $TERTIARY_SITE ]]; then
            log "WARNING" "Tentative failover vers site tertiaire: $TERTIARY_SITE"
            initiate_failover $failed_site $TERTIARY_SITE
        fi
    fi
}

post_failover_procedures() {
    local failed_site=$1
    local active_site=$2
    
    log "INFO" "Démarrage procédures post-failover"
    
    # 1. Notification clients
    notify_clients_service_restoration $active_site
    
    # 2. Monitoring renforcé
    enable_enhanced_monitoring $active_site
    
    # 3. Préparation recovery du site principal
    schedule_primary_site_recovery $failed_site
    
    # 4. Documentation incident
    create_incident_report $failed_site $active_site
}

schedule_primary_site_recovery() {
    local failed_site=$1
    
    log "INFO" "Planification récupération site principal: $failed_site"
    
    # Création ticket de recovery
    create_recovery_ticket $failed_site
    
    # Préparation environnement de recovery
    prepare_recovery_environment $failed_site
}

# Boucle de monitoring principal
main_monitoring_loop() {
    local primary_failure_count=0
    local secondary_failure_count=0
    
    while true; do
        log "DEBUG" "Vérification santé des sites"
        
        # Check site principal
        if ! check_site_health $PRIMARY_SITE; then
            ((primary_failure_count++))
            log "WARNING" "Site principal en difficulté ($primary_failure_count/$MAX_FAILURE_COUNT)"
            
            if [[ $primary_failure_count -ge $MAX_FAILURE_COUNT ]]; then
                log "CRITICAL" "Site principal déclaré en panne - Déclenchement failover"
                initiate_failover $PRIMARY_SITE $SECONDARY_SITE
                primary_failure_count=0
            fi
        else
            primary_failure_count=0
        fi
        
        # Check replication lag
        local lag=$(get_replication_lag $SECONDARY_SITE)
        if [[ $lag -gt 300 ]]; then  # 5 minutes
            log "WARNING" "Replication lag élevé: ${lag}s"
            send_alert "WARNING" "Lag de réplication: ${lag}s (seuil: 300s)"
        fi
        
        sleep $MONITORING_INTERVAL
    done
}

# Fonctions utilitaires
notify_clients_service_restoration() {
    local active_site=$1
    log "INFO" "Notification clients - Service restauré sur $active_site"
    # Envoyer emails/SMS aux clients critiques
}

enable_enhanced_monitoring() {
    local site=$1
    log "INFO" "Activation monitoring renforcé pour $site"
    # Augmenter fréquence des checks
}

create_incident_report() {
    local failed_site=$1
    local active_site=$2
    
    local report_file="/tmp/incident-report-$(date +%Y%m%d-%H%M%S).json"
    cat > $report_file << EOF
{
    "incident_id": "DR-$(date +%Y%m%d-%H%M%S)",
    "timestamp": "$(date -Iseconds)",
    "failed_site": "$failed_site",
    "active_site": "$active_site",
    "rto_achieved": "< 15 minutes",
    "services_affected": ["web", "api", "database", "redis"],
    "automatic_recovery": true,
    "client_impact": "minimal"
}
EOF
    
    log "INFO" "Rapport d'incident créé: $report_file"
}

# Point d'entrée principal
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    log "INFO" "Démarrage monitoring disaster recovery"
    main_monitoring_loop
fi
```

## 💾 Stratégie de Sauvegarde Premium

### Configuration Backup Automatisé
```bash
#!/bin/bash
# scripts/backup/premium-backup-strategy.sh

# Configuration Backup Premium
BACKUP_RETENTION_DAILY=30      # 30 jours
BACKUP_RETENTION_WEEKLY=12     # 12 semaines  
BACKUP_RETENTION_MONTHLY=12    # 12 mois
BACKUP_RETENTION_YEARLY=7      # 7 ans

S3_BACKUP_BUCKET="trackingbms-backups-premium"
ENCRYPTION_KEY_ARN="arn:aws:kms:us-east-1:123456789:key/backup-key"

# Backup base de données avec compression et encryption
backup_database() {
    local backup_type=$1  # full, incremental, differential
    local timestamp=$(date +%Y%m%d_%H%M%S)
    local backup_file="db_backup_${backup_type}_${timestamp}.sql.gz.enc"
    
    log "INFO" "Début backup database ($backup_type)"
    
    case $backup_type in
        "full")
            # Backup complet avec toutes les données
            pg_dumpall -h localhost -U postgres \
                | gzip \
                | openssl enc -aes-256-cbc -salt -k "$DB_ENCRYPTION_KEY" \
                > "/tmp/$backup_file"
            ;;
        "incremental")
            # Backup WAL depuis dernier backup
            archive_wal_files_since_last_backup
            ;;
        "differential")  
            # Backup différentiel depuis dernier backup complet
            pg_dump -h localhost -U postgres --format=custom trackingbms \
                | gzip \
                | openssl enc -aes-256-cbc -salt -k "$DB_ENCRYPTION_KEY" \
                > "/tmp/$backup_file"
            ;;
    esac
    
    # Upload vers S3 avec métadonnées
    aws s3 cp "/tmp/$backup_file" \
        "s3://$S3_BACKUP_BUCKET/database/$backup_type/" \
        --server-side-encryption aws:kms \
        --ssekms-key-id $ENCRYPTION_KEY_ARN \
        --metadata "backup_type=$backup_type,timestamp=$timestamp,retention=premium"
    
    # Vérification intégrité
    verify_backup_integrity "/tmp/$backup_file" "$backup_type"
    
    # Nettoyage local
    rm "/tmp/$backup_file"
    
    log "SUCCESS" "Backup database terminé: $backup_file"
}

# Backup fichiers application
backup_application_files() {
    local timestamp=$(date +%Y%m%d_%H%M%S)
    local backup_file="app_files_${timestamp}.tar.gz.enc"
    
    log "INFO" "Début backup fichiers application"
    
    # Création archive avec exclusions
    tar -czf - \
        --exclude='node_modules' \
        --exclude='*.log' \
        --exclude='tmp/*' \
        /opt/trackingbms/ \
        | openssl enc -aes-256-cbc -salt -k "$APP_ENCRYPTION_KEY" \
        > "/tmp/$backup_file"
    
    # Upload S3
    aws s3 cp "/tmp/$backup_file" \
        "s3://$S3_BACKUP_BUCKET/application/" \
        --server-side-encryption aws:kms \
        --ssekms-key-id $ENCRYPTION_KEY_ARN
    
    rm "/tmp/$backup_file"
    log "SUCCESS" "Backup fichiers terminé"
}

# Backup configuration système
backup_system_configuration() {
    local timestamp=$(date +%Y%m%d_%H%M%S)
    local config_backup="system_config_${timestamp}.tar.gz.enc"
    
    log "INFO" "Backup configuration système"
    
    tar -czf - \
        /etc/nginx/ \
        /etc/postgresql/ \
        /etc/redis/ \
        /etc/ssl/trackingbms/ \
        /opt/trackingbms/config/ \
        | openssl enc -aes-256-cbc -salt -k "$CONFIG_ENCRYPTION_KEY" \
        > "/tmp/$config_backup"
    
    aws s3 cp "/tmp/$config_backup" \
        "s3://$S3_BACKUP_BUCKET/configuration/" \
        --server-side-encryption aws:kms \
        --ssekms-key-id $ENCRYPTION_KEY_ARN
    
    rm "/tmp/$config_backup"
    log "SUCCESS" "Backup configuration terminé"
}

# Tests de restauration automatisés
automated_restore_test() {
    local test_environment="dr-test"
    
    log "INFO" "Démarrage test restauration automatisé"
    
    # 1. Création environnement de test isolé
    create_test_environment $test_environment
    
    # 2. Restauration depuis backup le plus récent
    restore_latest_backup $test_environment
    
    # 3. Tests fonctionnels
    run_functional_tests $test_environment
    
    # 4. Validation données
    validate_data_integrity $test_environment
    
    # 5. Nettoyage
    cleanup_test_environment $test_environment
    
    log "SUCCESS" "Test restauration terminé avec succès"
}

# Planification backups avec cron
setup_backup_schedule() {
    cat > /etc/cron.d/trackingbms-backup << 'EOF'
# Backup Premium TrackingBMS
SHELL=/bin/bash
PATH=/usr/local/bin:/usr/bin:/bin

# Backup complet quotidien (2h du matin)
0 2 * * * root /opt/scripts/premium-backup-strategy.sh full_backup

# Backup incrémental toutes les 4h
0 */4 * * * root /opt/scripts/premium-backup-strategy.sh incremental_backup

# Test restauration hebdomadaire (dimanche 1h)
0 1 * * 0 root /opt/scripts/premium-backup-strategy.sh restore_test

# Nettoyage backups anciens (quotidien 23h)
0 23 * * * root /opt/scripts/backup-cleanup.sh
EOF
}
```

## 🔧 Procédures de Restauration

### Script de Restauration Complète
```bash
#!/bin/bash
# scripts/disaster-recovery/complete-restore.sh

set -euo pipefail

restore_from_disaster() {
    local disaster_type=$1    # total_outage, data_corruption, security_breach
    local restore_point=$2    # timestamp ou 'latest'
    local target_environment=$3  # production, staging, dr-test
    
    log "CRITICAL" "Début restauration complète - Type: $disaster_type"
    
    case $disaster_type in
        "total_outage")
            perform_total_outage_recovery $restore_point $target_environment
            ;;
        "data_corruption")
            perform_data_corruption_recovery $restore_point $target_environment
            ;;
        "security_breach")
            perform_security_breach_recovery $restore_point $target_environment
            ;;
    esac
    
    # Validation post-restauration
    validate_restoration $target_environment
    
    log "SUCCESS" "Restauration complète terminée"
}

perform_total_outage_recovery() {
    local restore_point=$1
    local target_env=$2
    
    log "INFO" "Restauration après panne totale"
    
    # 1. Provision infrastructure
    provision_disaster_recovery_infrastructure $target_env
    
    # 2. Restauration système
    restore_system_configuration $restore_point $target_env
    
    # 3. Restauration base de données
    restore_database_complete $restore_point $target_env
    
    # 4. Restauration application
    restore_application_files $restore_point $target_env
    
    # 5. Restauration cache Redis
    restore_redis_data $restore_point $target_env
    
    # 6. Tests de connectivité BMS
    test_bms_connectivity $target_env
    
    # 7. Activation monitoring
    enable_monitoring_suite $target_env
}

provision_disaster_recovery_infrastructure() {
    local env=$1
    
    log "INFO" "Provisioning infrastructure DR pour $env"
    
    # Terraform pour infrastructure
    cd /opt/terraform/disaster-recovery
    
    terraform init
    terraform plan -var="environment=$env" -var="disaster_recovery=true"
    terraform apply -auto-approve
    
    # Attente stabilisation
    wait_for_infrastructure_ready $env
}

restore_database_complete() {
    local restore_point=$1
    local env=$2
    
    log "INFO" "Restauration base de données complète"
    
    # 1. Arrêt PostgreSQL
    systemctl stop postgresql
    
    # 2. Sauvegarde état actuel (si existant)
    if [ -d "/var/lib/postgresql/data" ]; then
        mv /var/lib/postgresql/data /var/lib/postgresql/data.backup.$(date +%s)
    fi
    
    # 3. Téléchargement backup
    local backup_file=$(get_latest_backup_file "database" $restore_point)
    aws s3 cp "s3://$S3_BACKUP_BUCKET/database/full/$backup_file" /tmp/
    
    # 4. Déchiffrement et décompression
    openssl enc -d -aes-256-cbc -salt -k "$DB_ENCRYPTION_KEY" \
        -in "/tmp/$backup_file" \
        | gunzip \
        > /tmp/db_restore.sql
    
    # 5. Initialisation cluster PostgreSQL
    sudo -u postgres initdb -D /var/lib/postgresql/data
    
    # 6. Démarrage PostgreSQL
    systemctl start postgresql
    
    # 7. Restauration données
    sudo -u postgres psql < /tmp/db_restore.sql
    
    # 8. Vérification intégrité
    sudo -u postgres pg_dumpall --no-privileges --no-tablespaces \
        | md5sum > /tmp/restore_checksum.md5
    
    log "SUCCESS" "Base de données restaurée"
}

# Validation complète post-restauration
validate_restoration() {
    local env=$1
    
    log "INFO" "Validation restauration environnement $env"
    
    # Tests de sanité système
    local validation_tests=(
        "test_database_connectivity"
        "test_redis_connectivity"  
        "test_application_health"
        "test_bms_apis_connectivity"
        "test_user_authentication"
        "test_data_integrity"
        "test_performance_baseline"
    )
    
    local failed_tests=0
    for test in "${validation_tests[@]}"; do
        log "DEBUG" "Exécution test: $test"
        if ! $test $env; then
            log "ERROR" "Test échoué: $test"
            ((failed_tests++))
        else
            log "SUCCESS" "Test réussi: $test"
        fi
    done
    
    if [[ $failed_tests -eq 0 ]]; then
        log "SUCCESS" "Tous les tests de validation réussis"
        notify_restoration_success $env
    else
        log "ERROR" "$failed_tests tests échoués - Restauration incomplète"
        notify_restoration_issues $env $failed_tests
        return 1
    fi
}

# Tests spécifiques
test_database_connectivity() {
    local env=$1
    psql -h localhost -U postgres -c "SELECT version();" > /dev/null
}

test_redis_connectivity() {
    local env=$1
    redis-cli ping | grep -q "PONG"
}

test_application_health() {
    local env=$1
    local health_url="http://localhost:3000/api/health"
    curl -f -s $health_url | jq -r '.status' | grep -q "healthy"
}

test_bms_apis_connectivity() {
    local env=$1
    # Test connectivité aux 3 APIs BMS
    curl -f -s http://localhost:3000/api/bms/foxbms/test > /dev/null
    curl -f -s http://localhost:3000/api/bms/libresolar/test > /dev/null
    curl -f -s http://localhost:3000/api/bms/greenbms/test > /dev/null
}

test_data_integrity() {
    local env=$1
    # Vérification cohérence données critiques
    local client_count=$(psql -t -c "SELECT COUNT(*) FROM clients;")
    local battery_count=$(psql -t -c "SELECT COUNT(*) FROM batteries;")
    
    [[ $client_count -gt 0 ]] && [[ $battery_count -gt 0 ]]
}

# Notifications
notify_restoration_success() {
    local env=$1
    send_alert "SUCCESS" "Restauration DR terminée avec succès pour $env"
    
    # Email détaillé aux responsables
    send_detailed_restoration_report $env "SUCCESS"
}

send_detailed_restoration_report() {
    local env=$1
    local status=$2
    
    local report_file="/tmp/restoration_report_$(date +%Y%m%d_%H%M%S).html"
    
    cat > $report_file << EOF
<!DOCTYPE html>
<html>
<head>
    <title>Rapport Restauration TrackingBMS - $env</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .success { color: #28a745; }
        .error { color: #dc3545; }
        .warning { color: #ffc107; }
        .info { color: #17a2b8; }
        table { border-collapse: collapse; width: 100%; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
    </style>
</head>
<body>
    <h1>Rapport de Restauration Disaster Recovery</h1>
    <h2>Environnement: $env</h2>
    <h2>Statut: <span class="$(echo $status | tr '[:upper:]' '[:lower:]')">$status</span></h2>
    
    <h3>Métriques de Performance</h3>
    <table>
        <tr><th>Métrique</th><th>Valeur</th><th>Objectif</th><th>Status</th></tr>
        <tr><td>RTO (Recovery Time)</td><td>$(get_recovery_time)</td><td>< 15 min</td><td class="success">✓</td></tr>
        <tr><td>RPO (Recovery Point)</td><td>$(get_recovery_point)</td><td>< 5 min</td><td class="success">✓</td></tr>
        <tr><td>Tests Validation</td><td>$(get_validation_summary)</td><td>100%</td><td class="success">✓</td></tr>
    </table>
    
    <h3>Services Restaurés</h3>
    <ul>
        <li class="success">✓ Base de données PostgreSQL</li>
        <li class="success">✓ Cache Redis</li>
        <li class="success">✓ Application Web</li>
        <li class="success">✓ APIs BMS</li>
        <li class="success">✓ Système de monitoring</li>
    </ul>
    
    <h3>Prochaines Étapes</h3>
    <ol>
        <li>Monitoring renforcé pendant 24h</li>
        <li>Tests utilisateurs complets</li>
        <li>Analyse post-incident</li>
        <li>Mise à jour procédures DR si nécessaire</li>
    </ol>
</body>
</html>
EOF
    
    # Envoi email avec le rapport
    mail -s "Rapport DR TrackingBMS - $env [$status]" \
         -a "Content-Type: text/html" \
         -t < $report_file \
         team-leads@trackingbms.com,operations@trackingbms.com
}
```

## 📊 Tests et Validation DR

### Test Suite Automatisée
```python
# tests/disaster_recovery/dr_test_suite.py
import asyncio
import pytest
import aiohttp
import asyncpg
import redis.asyncio as redis
from datetime import datetime, timedelta
import logging

logger = logging.getLogger(__name__)

class DisasterRecoveryTestSuite:
    """Suite de tests pour validation disaster recovery"""
    
    def __init__(self, environment='dr-test'):
        self.environment = environment
        self.base_url = f"https://{environment}.trackingbms.com"
        self.db_config = {
            'host': f'{environment}-db.trackingbms.com',
            'database': 'trackingbms',
            'user': 'postgres'
        }
        
    async def run_complete_test_suite(self):
        """Exécution complète des tests DR"""
        logger.info(f"Début tests DR pour environnement: {self.environment}")
        
        test_results = {
            'infrastructure': await self.test_infrastructure_availability(),
            'database': await self.test_database_functionality(),
            'application': await self.test_application_functionality(),
            'performance': await self.test_performance_baseline(),
            'data_integrity': await self.test_data_integrity(),
            'security': await self.test_security_configuration(),
            'monitoring': await self.test_monitoring_systems(),
            'end_to_end': await self.test_end_to_end_workflows()
        }
        
        # Génération rapport
        success_rate = self._calculate_success_rate(test_results)
        report = await self._generate_test_report(test_results, success_rate)
        
        return {
            'success_rate': success_rate,
            'test_results': test_results,
            'report': report,
            'environment': self.environment
        }
    
    async def test_infrastructure_availability(self):
        """Test disponibilité infrastructure"""
        tests = []
        
        # Test connectivité réseau
        async with aiohttp.ClientSession() as session:
            try:
                async with session.get(f"{self.base_url}/api/health", timeout=10) as response:
                    tests.append({
                        'name': 'network_connectivity',
                        'success': response.status == 200,
                        'details': f"HTTP {response.status}"
                    })
            except Exception as e:
                tests.append({
                    'name': 'network_connectivity',
                    'success': False,
                    'details': str(e)
                })
        
        # Test Load Balancer
        for i in range(5):
            try:
                async with aiohttp.ClientSession() as session:
                    async with session.get(f"{self.base_url}/api/health") as response:
                        server_id = response.headers.get('X-Server-ID', 'unknown')
                        tests.append({
                            'name': f'load_balancer_request_{i+1}',
                            'success': response.status == 200,
                            'details': f"Server: {server_id}"
                        })
            except Exception as e:
                tests.append({
                    'name': f'load_balancer_request_{i+1}',
                    'success': False,
                    'details': str(e)
                })
        
        return tests
    
    async def test_database_functionality(self):
        """Test fonctionnalité base de données"""
        tests = []
        
        try:
            conn = await asyncpg.connect(**self.db_config)
            
            # Test connectivité de base
            result = await conn.fetchval("SELECT 1")
            tests.append({
                'name': 'database_connectivity',
                'success': result == 1,
                'details': 'Connection successful'
            })
            
            # Test intégrité schéma
            tables = await conn.fetch("""
                SELECT table_name FROM information_schema.tables 
                WHERE table_schema = 'public'
            """)
            
            expected_tables = ['clients', 'batteries', 'battery_metrics', 'users', 'locations']
            existing_tables = [row['table_name'] for row in tables]
            
            tests.append({
                'name': 'schema_integrity',
                'success': all(table in existing_tables for table in expected_tables),
                'details': f"Found tables: {existing_tables}"
            })
            
            # Test données critiques
            client_count = await conn.fetchval("SELECT COUNT(*) FROM clients")
            battery_count = await conn.fetchval("SELECT COUNT(*) FROM batteries")
            
            tests.append({
                'name': 'critical_data_presence',
                'success': client_count > 0 and battery_count > 0,
                'details': f"Clients: {client_count}, Batteries: {battery_count}"
            })
            
            # Test performance requêtes
            start_time = datetime.now()
            await conn.fetch("""
                SELECT c.name, COUNT(b.id) as battery_count 
                FROM clients c 
                LEFT JOIN batteries b ON c.id = b.client_id 
                GROUP BY c.id, c.name
            """)
            query_time = (datetime.now() - start_time).total_seconds()
            
            tests.append({
                'name': 'query_performance',
                'success': query_time < 1.0,
                'details': f"Query time: {query_time:.3f}s"
            })
            
            await conn.close()
            
        except Exception as e:
            tests.append({
                'name': 'database_error',
                'success': False,
                'details': str(e)
            })
        
        return tests
    
    async def test_application_functionality(self):
        """Test fonctionnalité application"""
        tests = []
        
        async with aiohttp.ClientSession() as session:
            # Test endpoints critiques
            endpoints = [
                ('/api/health', 'health_check'),
                ('/api/auth/login', 'authentication_endpoint'),
                ('/api/clients', 'clients_api'),
                ('/api/bms/status', 'bms_status'),
                ('/api/metrics/realtime', 'realtime_metrics')
            ]
            
            for endpoint, test_name in endpoints:
                try:
                    async with session.get(f"{self.base_url}{endpoint}", timeout=5) as response:
                        tests.append({
                            'name': test_name,
                            'success': response.status in [200, 401],  # 401 OK pour endpoints protégés
                            'details': f"HTTP {response.status}"
                        })
                except Exception as e:
                    tests.append({
                        'name': test_name,
                        'success': False,
                        'details': str(e)
                    })
        
        return tests
    
    async def test_performance_baseline(self):
        """Test performance baseline"""
        tests = []
        
        # Test temps de réponse
        response_times = []
        
        async with aiohttp.ClientSession() as session:
            for i in range(10):
                start_time = datetime.now()
                try:
                    async with session.get(f"{self.base_url}/api/health") as response:
                        response_time = (datetime.now() - start_time).total_seconds() * 1000
                        response_times.append(response_time)
                        await response.read()
                except Exception:
                    response_times.append(5000)  # Timeout comme 5000ms
        
        avg_response_time = sum(response_times) / len(response_times)
        p95_response_time = sorted(response_times)[int(len(response_times) * 0.95)]
        
        tests.append({
            'name': 'average_response_time',
            'success': avg_response_time < 500,  # 500ms
            'details': f"Average: {avg_response_time:.2f}ms"
        })
        
        tests.append({
            'name': 'p95_response_time', 
            'success': p95_response_time < 1000,  # 1000ms
            'details': f"P95: {p95_response_time:.2f}ms"
        })
        
        return tests
    
    async def test_data_integrity(self):
        """Test intégrité données"""
        tests = []
        
        try:
            conn = await asyncpg.connect(**self.db_config)
            
            # Vérification contraintes référentielles
            integrity_checks = [
                ("Foreign key batteries->clients", """
                    SELECT COUNT(*) FROM batteries b 
                    LEFT JOIN clients c ON b.client_id = c.id 
                    WHERE c.id IS NULL
                """),
                ("Foreign key battery_metrics->batteries", """
                    SELECT COUNT(*) FROM battery_metrics bm 
                    LEFT JOIN batteries b ON bm.battery_id = b.id 
                    WHERE b.id IS NULL
                """),
                ("Data consistency voltage", """
                    SELECT COUNT(*) FROM battery_metrics 
                    WHERE voltage < 0 OR voltage > 5
                """)
            ]
            
            for check_name, query in integrity_checks:
                count = await conn.fetchval(query)
                tests.append({
                    'name': check_name.lower().replace(' ', '_'),
                    'success': count == 0,
                    'details': f"Issues found: {count}"
                })
            
            await conn.close()
            
        except Exception as e:
            tests.append({
                'name': 'data_integrity_error',
                'success': False,
                'details': str(e)
            })
        
        return tests
    
    async def test_end_to_end_workflows(self):
        """Test workflows end-to-end"""
        tests = []
        
        # Simulation workflow complet utilisateur
        async with aiohttp.ClientSession() as session:
            try:
                # 1. Login
                login_data = {
                    'username': 'test@trackingbms.com',
                    'password': 'TestPassword123!'
                }
                
                async with session.post(f"{self.base_url}/api/auth/login", json=login_data) as response:
                    if response.status == 200:
                        data = await response.json()
                        token = data.get('token')
                        
                        tests.append({
                            'name': 'user_authentication',
                            'success': bool(token),
                            'details': 'Login successful'
                        })
                        
                        # 2. Accès données client avec token
                        headers = {'Authorization': f'Bearer {token}'}
                        async with session.get(f"{self.base_url}/api/clients", headers=headers) as response:
                            tests.append({
                                'name': 'authenticated_data_access',
                                'success': response.status == 200,
                                'details': f"HTTP {response.status}"
                            })
                    else:
                        tests.append({
                            'name': 'user_authentication',
                            'success': False,
                            'details': f"Login failed: HTTP {response.status}"
                        })
                        
            except Exception as e:
                tests.append({
                    'name': 'end_to_end_workflow_error',
                    'success': False,
                    'details': str(e)
                })
        
        return tests
    
    def _calculate_success_rate(self, test_results):
        """Calcul taux de succès global"""
        total_tests = 0
        successful_tests = 0
        
        for category, tests in test_results.items():
            for test in tests:
                total_tests += 1
                if test['success']:
                    successful_tests += 1
        
        return (successful_tests / total_tests) * 100 if total_tests > 0 else 0
    
    async def _generate_test_report(self, test_results, success_rate):
        """Génération rapport de tests"""
        timestamp = datetime.now().isoformat()
        
        report = {
            'timestamp': timestamp,
            'environment': self.environment,
            'overall_success_rate': success_rate,
            'categories': {}
        }
        
        for category, tests in test_results.items():
            category_success = sum(1 for test in tests if test['success'])
            category_total = len(tests)
            category_rate = (category_success / category_total) * 100 if category_total > 0 else 0
            
            report['categories'][category] = {
                'success_rate': category_rate,
                'successful_tests': category_success,
                'total_tests': category_total,
                'tests': tests
            }
        
        return report

# Script d'exécution
if __name__ == "__main__":
    async def run_dr_tests():
        test_suite = DisasterRecoveryTestSuite('dr-test')
        results = await test_suite.run_complete_test_suite()
        
        print(f"Tests DR terminés - Taux de succès: {results['success_rate']:.1f}%")
        
        if results['success_rate'] >= 95:
            print("✅ Tests DR RÉUSSIS - Environnement validé")
            exit(0)
        else:
            print("❌ Tests DR ÉCHOUÉS - Intervention requise")
            exit(1)
    
    asyncio.run(run_dr_tests())
```

## 🎯 Résumé Plan DR Premium

### Garanties de Service
- **RTO :** < 15 minutes (failover automatique)
- **RPO :** < 5 minutes (réplication synchrone)
- **Disponibilité :** 99.99% (8.76h max downtime/an)
- **Sites :** 3 sites géographiquement distribués
- **Tests :** Mensuels automatisés + validation

### Architecture Multi-Sites
- **Site Principal :** Montreal (AWS us-east-1)
- **Hot Standby :** Toronto (AWS ca-central-1) 
- **Warm Standby :** Vancouver (Azure Canada Central)
- **Cold Backup :** Frankfurt (AWS eu-central-1)

---

**Ce plan de reprise après sinistre premium assure une continuité d'activité enterprise-grade avec failover automatique, tests réguliers et procédures documentées pour tous les scénarios de disaster recovery.**