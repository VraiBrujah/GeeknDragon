# Intégration DalyBMS Communication Premium - TrackingBMS

**Version :** 1.0 Premium  
**Date :** 2025-09-01  
**Répertoire de Travail :** `C:\Users\Brujah\Documents\GitHub\GeeknDragon\Eds\TrackingBMS`

## 🎯 Architecture Communication DalyBMS

### Configuration Matérielle Supportée

**Connexions BMS DalyBMS :**
- **UART-1 & UART-2 :** Communication série principale
- **CAN/RS485 :** Bus de communication industriel  
- **DIO :** Entrées/sorties digitales pour signaux
- **Câbles fournis :**
  - UART-USB (conversion série-USB)
  - CAN/485-USB (conversion bus-USB)
  - UART-Antenne Bluetooth (communication sans fil)
  - RS485/CAN avec bornes A, CAN-L, B, CAN-H, ABGND

### Émetteurs Multi-Protocoles par Batterie

**Spécifications Émetteur TrackingBMS :**
```yaml
Hardware_Module:
  model: "TrackingBMS-TX-Premium"
  size: "75mm x 45mm x 20mm"
  power: "12V/24V DC input, 2.5W consommation max"
  mounting: "DIN rail compatible"
  
Communication_Protocols:
  bluetooth:
    version: "5.2 LE"
    range: "50 mètres (ligne droite)"
    pairing: "Automatique avec authentification"
    
  wifi:
    standard: "802.11 b/g/n"
    frequency: "2.4GHz"
    security: "WPA2-Enterprise"
    
  gprs:
    bands: "850/900/1800/1900 MHz"
    protocols: "2G/3G/4G LTE-M"
    apn: "Configurable par opérateur"
    
BMS_Interfaces:
  uart_1: "3.3V TTL, 9600-115200 baud"
  uart_2: "3.3V TTL, 9600-115200 baud"  
  can_bus: "ISO 11898-2, 125kbps-1Mbps"
  rs485: "Modbus RTU compatible"
  dio: "4 entrées/sorties 12V/24V"
```

## 📡 Architecture Communication Hybride

### Topologie Réseau Multi-Niveaux

```
🏭 Site Client
├─ 🔋 Batterie #1 + Émetteur TrackingBMS
│   ├─ 📶 Bluetooth (proximité < 50m)
│   ├─ 📡 WiFi (réseau local entreprise)
│   └─ 📱 GPRS (backup/remote)
│
├─ 🔋 Batterie #2 + Émetteur TrackingBMS  
│   ├─ 📶 Bluetooth (proximité < 50m)
│   ├─ 📡 WiFi (réseau local entreprise)
│   └─ 📱 GPRS (backup/remote)
│
└─ 💻 Interface Client Mobile/Web
    ├─ 🔵 Connexion Directe (Bluetooth/WiFi local)
    └─ 🌐 Connexion Serveur (Internet)

☁️ Infrastructure TrackingBMS Premium
├─ 🖥️ Serveurs de Collecte (Montreal/Toronto/Paris)
├─ 📊 Base de Données Multi-Tenant
├─ 🤖 Moteur Analytics/ML
└─ 📱 API Client Web/Mobile
```

### Protocoles Communication DalyBMS

**Protocole UART (Serial) :**
```python
# Protocole UART DalyBMS - Implémentation Python
import serial
import struct
import time
from enum import Enum

class DalyBMSProtocol:
    """Protocole communication UART avec DalyBMS"""
    
    # Commandes DalyBMS officielles
    COMMANDS = {
        'VOLTAGE_INFO': 0x90,       # Tensions cellules
        'TEMP_INFO': 0x91,          # Températures
        'CELL_BALANCE': 0x92,       # État équilibrage
        'FAILURE_CODES': 0x93,      # Codes erreur
        'STATUS_INFO': 0x94,        # États généraux
        'CELL_VOLTAGE': 0x95,       # Tensions individuelles
        'CELL_TEMP': 0x96,          # Températures individuelles
        'BALANCE_STATUS': 0x97,     # Statut équilibrage
        'PROTECTION_STATUS': 0x98,  # États protection
        'VERSION_INFO': 0x99,       # Version firmware
        'SOC_SOH_INFO': 0x9A,       # SOC et SOH
    }
    
    def __init__(self, port, baudrate=9600, timeout=1.0):
        self.port = port
        self.baudrate = baudrate
        self.timeout = timeout
        self.serial = None
        self.device_id = 0x40  # ID par défaut DalyBMS
        
    def connect(self):
        """Connexion au BMS DalyBMS"""
        try:
            self.serial = serial.Serial(
                port=self.port,
                baudrate=self.baudrate,
                bytesize=serial.EIGHTBITS,
                parity=serial.PARITY_NONE,
                stopbits=serial.STOPBITS_ONE,
                timeout=self.timeout
            )
            
            # Test connexion
            if self.get_version_info():
                return {"status": "connected", "port": self.port}
            else:
                raise Exception("Pas de réponse du BMS")
                
        except Exception as e:
            return {"status": "error", "message": str(e)}
    
    def send_command(self, command_code, data_length=0):
        """Envoi commande DalyBMS avec protocole standard"""
        
        # Format trame DalyBMS: [START][DEVICE_ID][COMMAND][LENGTH][DATA][CHECKSUM][END]
        frame = bytearray()
        frame.append(0xA5)  # START byte
        frame.append(self.device_id)  # Device ID
        frame.append(command_code)    # Command
        frame.append(data_length)     # Data length
        
        # Calcul checksum
        checksum = sum(frame) & 0xFF
        frame.append(checksum)
        
        # Envoi via UART
        self.serial.write(frame)
        self.serial.flush()
        
        # Lecture réponse
        return self.read_response()
    
    def read_response(self):
        """Lecture réponse DalyBMS avec parsing"""
        try:
            # Lecture header
            start_byte = self.serial.read(1)
            if not start_byte or start_byte[0] != 0xA5:
                return None
                
            device_id = self.serial.read(1)[0]
            command = self.serial.read(1)[0]
            data_length = self.serial.read(1)[0]
            
            # Lecture données
            data = self.serial.read(data_length) if data_length > 0 else b''
            
            # Lecture checksum
            checksum = self.serial.read(1)[0]
            
            # Validation checksum
            calculated_checksum = (0xA5 + device_id + command + data_length + sum(data)) & 0xFF
            if checksum != calculated_checksum:
                raise Exception(f"Checksum invalide: {checksum} != {calculated_checksum}")
            
            return {
                'device_id': device_id,
                'command': command,
                'data': data,
                'raw_frame': start_byte + bytes([device_id, command, data_length]) + data + bytes([checksum])
            }
            
        except Exception as e:
            return {"error": str(e)}
    
    def get_basic_info(self):
        """Récupération infos de base (SOC, voltage, courant, etc.)"""
        response = self.send_command(self.COMMANDS['STATUS_INFO'])
        if not response or 'error' in response:
            return None
            
        data = response['data']
        if len(data) >= 13:
            return {
                'voltage': struct.unpack('>H', data[0:2])[0] / 10.0,  # Voltage pack (0.1V)
                'current': struct.unpack('>h', data[2:4])[0] / 10.0,  # Courant (0.1A, signé)
                'soc': struct.unpack('>H', data[4:6])[0] / 10.0,      # SOC (0.1%)
                'remaining_capacity': struct.unpack('>H', data[6:8])[0] / 100.0,  # Capacité restante (0.01Ah)
                'full_capacity': struct.unpack('>H', data[8:10])[0] / 100.0,      # Capacité totale (0.01Ah)
                'cycles': struct.unpack('>H', data[10:12])[0],        # Nb cycles
                'timestamp': time.time()
            }
        return None
    
    def get_cell_voltages(self):
        """Lecture tensions individuelles des cellules"""
        response = self.send_command(self.COMMANDS['CELL_VOLTAGE'])
        if not response or 'error' in response:
            return None
            
        data = response['data']
        cell_count = len(data) // 2  # 2 bytes par cellule
        
        voltages = []
        for i in range(cell_count):
            voltage = struct.unpack('>H', data[i*2:(i+1)*2])[0] / 1000.0  # mV vers V
            voltages.append(voltage)
            
        return {
            'cell_voltages': voltages,
            'cell_count': cell_count,
            'min_voltage': min(voltages),
            'max_voltage': max(voltages),
            'voltage_difference': max(voltages) - min(voltages),
            'timestamp': time.time()
        }
    
    def get_temperatures(self):
        """Lecture températures des sondes"""
        response = self.send_command(self.COMMANDS['TEMP_INFO'])
        if not response or 'error' in response:
            return None
            
        data = response['data']
        temp_count = len(data) // 2
        
        temperatures = []
        for i in range(temp_count):
            # Température en dixièmes de degré, offset -40°C
            temp_raw = struct.unpack('>H', data[i*2:(i+1)*2])[0]
            temp_celsius = (temp_raw - 2731) / 10.0  # Kelvin vers Celsius
            temperatures.append(temp_celsius)
            
        return {
            'temperatures': temperatures,
            'temp_count': temp_count,
            'min_temp': min(temperatures),
            'max_temp': max(temperatures),
            'avg_temp': sum(temperatures) / len(temperatures),
            'timestamp': time.time()
        }
    
    def get_alarm_status(self):
        """Lecture états d'alarme et protection"""
        response = self.send_command(self.COMMANDS['PROTECTION_STATUS'])
        if not response or 'error' in response:
            return None
            
        data = response['data']
        if len(data) >= 4:
            alarm_flags = struct.unpack('>I', data[0:4])[0]  # 32 bits d'alarmes
            
            alarms = {
                'cell_overvoltage': bool(alarm_flags & 0x0001),
                'cell_undervoltage': bool(alarm_flags & 0x0002),
                'pack_overvoltage': bool(alarm_flags & 0x0004),
                'pack_undervoltage': bool(alarm_flags & 0x0008),
                'charge_overcurrent': bool(alarm_flags & 0x0010),
                'discharge_overcurrent': bool(alarm_flags & 0x0020),
                'charge_overtemp': bool(alarm_flags & 0x0040),
                'charge_undertemp': bool(alarm_flags & 0x0080),
                'discharge_overtemp': bool(alarm_flags & 0x0100),
                'discharge_undertemp': bool(alarm_flags & 0x0200),
                'mos_overtemp': bool(alarm_flags & 0x0400),
                'environment_overtemp': bool(alarm_flags & 0x0800),
                'timestamp': time.time()
            }
            
            return alarms
            
        return None

# Implémentation CAN Bus pour DalyBMS
class DalyBMSCAN:
    """Communication CAN Bus avec DalyBMS"""
    
    def __init__(self, interface='socketcan', channel='can0', bitrate=500000):
        self.interface = interface
        self.channel = channel
        self.bitrate = bitrate
        self.bus = None
        
        # IDs CAN DalyBMS standard
        self.CAN_IDS = {
            'BASIC_INFO': 0x18FF50E5,      # Infos de base
            'CELL_VOLTAGES': 0x18FF51E5,   # Tensions cellules
            'TEMPERATURES': 0x18FF52E5,    # Températures
            'BALANCE_STATUS': 0x18FF53E5,  # État équilibrage
            'FAULT_STATUS': 0x18FF54E5,    # États de défaut
        }
    
    def connect(self):
        """Connexion au bus CAN"""
        try:
            import can
            self.bus = can.interface.Bus(
                interface=self.interface,
                channel=self.channel,
                bitrate=self.bitrate
            )
            return {"status": "connected", "channel": self.channel}
        except Exception as e:
            return {"status": "error", "message": str(e)}
    
    def listen_messages(self, timeout=1.0):
        """Écoute messages CAN du BMS"""
        if not self.bus:
            return None
            
        try:
            message = self.bus.recv(timeout=timeout)
            if message:
                return self.parse_can_message(message)
        except Exception as e:
            return {"error": str(e)}
        
        return None
    
    def parse_can_message(self, message):
        """Parsing messages CAN DalyBMS"""
        can_id = message.arbitration_id
        data = message.data
        
        if can_id == self.CAN_IDS['BASIC_INFO']:
            return {
                'type': 'basic_info',
                'voltage': struct.unpack('>H', data[0:2])[0] / 10.0,
                'current': struct.unpack('>h', data[2:4])[0] / 10.0,
                'soc': struct.unpack('>H', data[4:6])[0] / 10.0,
                'timestamp': time.time()
            }
        elif can_id == self.CAN_IDS['CELL_VOLTAGES']:
            voltages = []
            for i in range(0, len(data), 2):
                if i + 1 < len(data):
                    voltage = struct.unpack('>H', data[i:i+2])[0] / 1000.0
                    voltages.append(voltage)
            return {
                'type': 'cell_voltages',
                'voltages': voltages,
                'timestamp': time.time()
            }
        
        return {
            'type': 'unknown',
            'can_id': hex(can_id),
            'data': data.hex(),
            'timestamp': time.time()
        }
```

**Protocole RS485 (Modbus RTU) :**
```python
# Communication RS485 Modbus avec DalyBMS
import minimalmodbus
import struct
import time

class DalyBMSModbus:
    """Communication Modbus RTU avec DalyBMS via RS485"""
    
    def __init__(self, port, slave_id=1, baudrate=9600):
        self.port = port
        self.slave_id = slave_id
        self.baudrate = baudrate
        self.instrument = None
        
        # Registres Modbus DalyBMS (à ajuster selon firmware)
        self.REGISTERS = {
            'PACK_VOLTAGE': 0x1000,      # Tension pack
            'PACK_CURRENT': 0x1001,      # Courant pack
            'SOC': 0x1002,               # État de charge
            'SOH': 0x1003,               # État de santé
            'REMAINING_CAPACITY': 0x1004, # Capacité restante
            'FULL_CAPACITY': 0x1005,     # Capacité totale
            'CYCLES': 0x1006,            # Nombre de cycles
            'CELL_VOLTAGES_START': 0x2000, # Début tensions cellules
            'TEMPERATURES_START': 0x3000,  # Début températures
            'ALARM_FLAGS': 0x4000,       # Flags d'alarme
        }
    
    def connect(self):
        """Connexion Modbus RTU"""
        try:
            self.instrument = minimalmodbus.Instrument(self.port, self.slave_id)
            self.instrument.serial.baudrate = self.baudrate
            self.instrument.serial.bytesize = 8
            self.instrument.serial.parity = minimalmodbus.serial.PARITY_NONE
            self.instrument.serial.stopbits = 1
            self.instrument.serial.timeout = 1.0
            self.instrument.mode = minimalmodbus.MODE_RTU
            
            # Test connexion
            version = self.instrument.read_register(0x0000, 0)
            return {"status": "connected", "version": version}
            
        except Exception as e:
            return {"status": "error", "message": str(e)}
    
    def read_basic_data(self):
        """Lecture données de base via Modbus"""
        try:
            data = {}
            data['voltage'] = self.instrument.read_register(self.REGISTERS['PACK_VOLTAGE'], 1)
            data['current'] = self.instrument.read_register(self.REGISTERS['PACK_CURRENT'], 1, signed=True)
            data['soc'] = self.instrument.read_register(self.REGISTERS['SOC'], 1)
            data['soh'] = self.instrument.read_register(self.REGISTERS['SOH'], 1)
            data['remaining_capacity'] = self.instrument.read_register(self.REGISTERS['REMAINING_CAPACITY'], 2)
            data['full_capacity'] = self.instrument.read_register(self.REGISTERS['FULL_CAPACITY'], 2)
            data['cycles'] = self.instrument.read_register(self.REGISTERS['CYCLES'], 0)
            data['timestamp'] = time.time()
            
            return data
        except Exception as e:
            return {"error": str(e)}
    
    def read_cell_voltages(self, cell_count=16):
        """Lecture tensions cellules via Modbus"""
        try:
            voltages = []
            for i in range(cell_count):
                voltage = self.instrument.read_register(
                    self.REGISTERS['CELL_VOLTAGES_START'] + i, 3
                )
                voltages.append(voltage)
            
            return {
                'cell_voltages': voltages,
                'cell_count': len(voltages),
                'min_voltage': min(voltages),
                'max_voltage': max(voltages),
                'timestamp': time.time()
            }
        except Exception as e:
            return {"error": str(e)}
```

## 🔧 Module Émetteur TrackingBMS

### Firmware Émetteur Multi-Protocole

```cpp
// Firmware C++ pour émetteur TrackingBMS (ESP32 based)
#include <WiFi.h>
#include <BluetoothSerial.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <HardwareSerial.h>
#include <ModbusMaster.h>

class TrackingBMSTransmitter {
private:
    // Configuration hardware
    HardwareSerial bmsSerial;
    ModbusMaster modbus;
    BluetoothSerial btSerial;
    WiFiClient wifiClient;
    HTTPClient httpClient;
    
    // Configuration réseau
    String wifiSSID;
    String wifiPassword;
    String serverURL;
    String deviceID;
    
    // États communication
    bool bluetoothEnabled = false;
    bool wifiEnabled = false;
    bool gprsEnabled = false;
    
    // Buffer données
    struct BMSData {
        float voltage;
        float current;
        float soc;
        float soh;
        float temperature;
        uint32_t timestamp;
        bool valid;
    };
    
    BMSData latestData;
    
public:
    void setup() {
        Serial.begin(115200);
        
        // Configuration pins
        pinMode(LED_BUILTIN, OUTPUT);
        pinMode(STATUS_LED_PIN, OUTPUT);
        
        // Initialisation communication BMS
        bmsSerial.begin(9600, SERIAL_8N1, BMS_RX_PIN, BMS_TX_PIN);
        modbus.begin(1, bmsSerial);  // Slave ID 1
        
        // Configuration Bluetooth
        setupBluetooth();
        
        // Configuration WiFi
        setupWiFi();
        
        // Configuration GPRS (si module présent)
        setupGPRS();
        
        Serial.println("TrackingBMS Transmitter initialized");
    }
    
    void loop() {
        // Lecture données BMS
        if (readBMSData()) {
            // Transmission selon priorité
            if (!transmitViaBluetooth()) {
                if (!transmitViaWiFi()) {
                    transmitViaGPRS();
                }
            }
        }
        
        // Gestion connexions directes
        handleDirectConnections();
        
        // Status LED
        updateStatusLED();
        
        delay(5000);  // Lecture toutes les 5 secondes
    }
    
private:
    void setupBluetooth() {
        if (btSerial.begin("TrackingBMS-" + deviceID)) {
            bluetoothEnabled = true;
            Serial.println("Bluetooth initialized");
        }
    }
    
    void setupWiFi() {
        WiFi.begin(wifiSSID.c_str(), wifiPassword.c_str());
        
        int attempts = 0;
        while (WiFi.status() != WL_CONNECTED && attempts < 20) {
            delay(1000);
            attempts++;
        }
        
        if (WiFi.status() == WL_CONNECTED) {
            wifiEnabled = true;
            Serial.println("WiFi connected: " + WiFi.localIP().toString());
        }
    }
    
    bool readBMSData() {
        // Tentative lecture via UART
        if (readBMSDataUART()) {
            return true;
        }
        
        // Fallback Modbus si UART échec
        if (readBMSDataModbus()) {
            return true;
        }
        
        return false;
    }
    
    bool readBMSDataUART() {
        // Implémentation protocole UART DalyBMS
        uint8_t command[] = {0xA5, 0x40, 0x90, 0x08, 0x00, 0x00, 0x00, 0x00, 0x7D};
        
        bmsSerial.write(command, sizeof(command));
        bmsSerial.flush();
        
        // Attente réponse
        delay(100);
        
        if (bmsSerial.available() >= 13) {
            uint8_t response[13];
            bmsSerial.readBytes(response, 13);
            
            if (response[0] == 0xA5) {  // Start byte valide
                latestData.voltage = ((response[4] << 8) | response[5]) / 10.0;
                latestData.current = ((response[6] << 8) | response[7]) / 10.0;
                latestData.soc = ((response[8] << 8) | response[9]) / 10.0;
                latestData.timestamp = millis();
                latestData.valid = true;
                
                return true;
            }
        }
        
        return false;
    }
    
    bool readBMSDataModbus() {
        uint8_t result;
        
        // Lecture tension pack
        result = modbus.readHoldingRegisters(0x1000, 1);
        if (result == modbus.ku8MBSuccess) {
            latestData.voltage = modbus.getResponseBuffer(0) / 10.0;
        } else {
            return false;
        }
        
        // Lecture courant
        result = modbus.readHoldingRegisters(0x1001, 1);
        if (result == modbus.ku8MBSuccess) {
            latestData.current = (int16_t)modbus.getResponseBuffer(0) / 10.0;
        }
        
        // Lecture SOC
        result = modbus.readHoldingRegisters(0x1002, 1);
        if (result == modbus.ku8MBSuccess) {
            latestData.soc = modbus.getResponseBuffer(0) / 10.0;
        }
        
        latestData.timestamp = millis();
        latestData.valid = true;
        
        return true;
    }
    
    bool transmitViaBluetooth() {
        if (!bluetoothEnabled || !btSerial.hasClient()) {
            return false;
        }
        
        DynamicJsonDocument doc(512);
        doc["device_id"] = deviceID;
        doc["voltage"] = latestData.voltage;
        doc["current"] = latestData.current;
        doc["soc"] = latestData.soc;
        doc["temperature"] = latestData.temperature;
        doc["timestamp"] = latestData.timestamp;
        doc["source"] = "bluetooth";
        
        String jsonString;
        serializeJson(doc, jsonString);
        
        btSerial.println(jsonString);
        
        Serial.println("Data sent via Bluetooth");
        return true;
    }
    
    bool transmitViaWiFi() {
        if (!wifiEnabled || WiFi.status() != WL_CONNECTED) {
            return false;
        }
        
        httpClient.begin(wifiClient, serverURL + "/api/v1/bms/data");
        httpClient.addHeader("Content-Type", "application/json");
        httpClient.addHeader("Authorization", "Bearer " + deviceToken);
        
        DynamicJsonDocument doc(512);
        doc["device_id"] = deviceID;
        doc["voltage"] = latestData.voltage;
        doc["current"] = latestData.current;
        doc["soc"] = latestData.soc;
        doc["temperature"] = latestData.temperature;
        doc["timestamp"] = latestData.timestamp;
        doc["source"] = "wifi";
        
        String jsonString;
        serializeJson(doc, jsonString);
        
        int httpResponseCode = httpClient.POST(jsonString);
        httpClient.end();
        
        if (httpResponseCode == 200) {
            Serial.println("Data sent via WiFi");
            return true;
        }
        
        return false;
    }
    
    bool transmitViaGPRS() {
        // Implémentation GPRS/cellular
        // À adapter selon module GPRS utilisé (SIM800L, SIM7600, etc.)
        Serial.println("GPRS transmission not implemented yet");
        return false;
    }
    
    void handleDirectConnections() {
        // Gestion commandes reçues via Bluetooth
        if (bluetoothEnabled && btSerial.available()) {
            String command = btSerial.readStringUntil('\n');
            processDirectCommand(command, "bluetooth");
        }
        
        // Gestion commandes WiFi direct (WebServer local)
        // Implémentation serveur web local sur l'émetteur
    }
    
    void processDirectCommand(String command, String source) {
        DynamicJsonDocument doc(256);
        deserializeJson(doc, command);
        
        String action = doc["action"];
        
        if (action == "get_data") {
            // Envoi données actuelles
            DynamicJsonDocument response(512);
            response["voltage"] = latestData.voltage;
            response["current"] = latestData.current;
            response["soc"] = latestData.soc;
            response["timestamp"] = latestData.timestamp;
            
            String jsonResponse;
            serializeJson(response, jsonResponse);
            
            if (source == "bluetooth") {
                btSerial.println(jsonResponse);
            }
        }
        else if (action == "configure") {
            // Configuration à distance
            if (doc.containsKey("wifi_ssid")) {
                wifiSSID = doc["wifi_ssid"].as<String>();
            }
            if (doc.containsKey("server_url")) {
                serverURL = doc["server_url"].as<String>();
            }
            
            // Sauvegarde en EEPROM
            saveConfiguration();
        }
    }
    
    void updateStatusLED() {
        static uint32_t lastBlink = 0;
        static bool ledState = false;
        
        uint32_t now = millis();
        
        if (wifiEnabled && WiFi.status() == WL_CONNECTED) {
            // WiFi connecté: LED fixe
            digitalWrite(STATUS_LED_PIN, HIGH);
        } else if (bluetoothEnabled && btSerial.hasClient()) {
            // Bluetooth connecté: clignotement lent
            if (now - lastBlink > 1000) {
                ledState = !ledState;
                digitalWrite(STATUS_LED_PIN, ledState);
                lastBlink = now;
            }
        } else {
            // Aucune connexion: clignotement rapide
            if (now - lastBlink > 200) {
                ledState = !ledState;
                digitalWrite(STATUS_LED_PIN, ledState);
                lastBlink = now;
            }
        }
    }
};

TrackingBMSTransmitter transmitter;

void setup() {
    transmitter.setup();
}

void loop() {
    transmitter.loop();
}
```

## 📱 Application Mobile - Connexion Directe

### Interface Mobile Hybride

```javascript
// Application React Native pour connexion directe + serveur
import React, { useState, useEffect } from 'react';
import { BleManager } from 'react-native-ble-plx';
import NetInfo from '@react-native-community/netinfo';
import AsyncStorage from '@react-native-async-storage/async-storage';

const TrackingBMSMobile = () => {
    const [connectionMode, setConnectionMode] = useState('auto'); // auto, direct, server
    const [nearbyDevices, setNearbyDevices] = useState([]);
    const [connectedDevice, setConnectedDevice] = useState(null);
    const [batteryData, setBatteryData] = useState({});
    const [isOnline, setIsOnline] = useState(true);
    
    const bleManager = new BleManager();
    
    useEffect(() => {
        initializeApp();
        return () => {
            bleManager.destroy();
        };
    }, []);
    
    const initializeApp = async () => {
        // Vérification état réseau
        const netState = await NetInfo.fetch();
        setIsOnline(netState.isConnected);
        
        // Détection mode de connexion optimal
        await detectOptimalConnection();
        
        // Démarrage scan Bluetooth si mode direct
        if (connectionMode === 'direct' || connectionMode === 'auto') {
            startBluetoothScan();
        }
    };
    
    const detectOptimalConnection = async () => {
        const netState = await NetInfo.fetch();
        
        if (!netState.isConnected) {
            // Pas d'internet -> Mode direct uniquement
            setConnectionMode('direct');
        } else {
            // Test ping serveur
            const serverReachable = await testServerConnection();
            if (serverReachable) {
                setConnectionMode('auto'); // Auto-switch selon proximité
            } else {
                setConnectionMode('direct');
            }
        }
    };
    
    const startBluetoothScan = () => {
        bleManager.startDeviceScan(null, null, (error, device) => {
            if (error) {
                console.error('Bluetooth scan error:', error);
                return;
            }
            
            // Filtrer uniquement les émetteurs TrackingBMS
            if (device.name && device.name.startsWith('TrackingBMS-')) {
                setNearbyDevices(prev => {
                    const exists = prev.find(d => d.id === device.id);
                    if (!exists) {
                        return [...prev, {
                            id: device.id,
                            name: device.name,
                            rssi: device.rssi,
                            device: device
                        }];
                    }
                    return prev;
                });
            }
        });
        
        // Arrêt scan après 10 secondes
        setTimeout(() => {
            bleManager.stopDeviceScan();
        }, 10000);
    };
    
    const connectToDevice = async (deviceInfo) => {
        try {
            // Connexion Bluetooth
            const device = await deviceInfo.device.connect();
            await device.discoverAllServicesAndCharacteristics();
            
            setConnectedDevice(device);
            
            // Démarrage lecture données temps réel
            startRealtimeDataRead(device);
            
            // Notification connexion
            showNotification('Connecté à ' + deviceInfo.name, 'success');
            
        } catch (error) {
            console.error('Connection error:', error);
            showNotification('Erreur connexion: ' + error.message, 'error');
        }
    };
    
    const startRealtimeDataRead = (device) => {
        // Lecture périodique des données via Bluetooth
        const dataInterval = setInterval(async () => {
            try {
                // Commande lecture données (protocole JSON simple)
                const command = JSON.stringify({ action: 'get_data' });
                
                // Envoi commande (à adapter selon services BLE)
                // await device.writeCharacteristicWithResponseForService(
                //     SERVICE_UUID, COMMAND_CHAR_UUID, base64Encode(command)
                // );
                
                // Lecture réponse
                // const response = await device.readCharacteristicForService(
                //     SERVICE_UUID, DATA_CHAR_UUID
                // );
                
                // Simulation données pour demo
                const simulatedData = {
                    voltage: 48.2 + Math.random() * 2,
                    current: 15.5 + Math.random() * 5,
                    soc: 85 + Math.random() * 10,
                    temperature: 23 + Math.random() * 5,
                    timestamp: Date.now(),
                    source: 'bluetooth_direct'
                };
                
                setBatteryData(simulatedData);
                
                // Sauvegarde locale pour historique
                await saveBatteryDataLocally(simulatedData);
                
            } catch (error) {
                console.error('Data read error:', error);
            }
        }, 5000);
        
        // Nettoyage à la déconnexion
        device.onDisconnected(() => {
            clearInterval(dataInterval);
            setConnectedDevice(null);
        });
    };
    
    const fetchServerData = async () => {
        if (!isOnline) return;
        
        try {
            const token = await AsyncStorage.getItem('auth_token');
            const response = await fetch('https://api.trackingbms.com/v1/batteries/realtime', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.ok) {
                const serverData = await response.json();
                setBatteryData({
                    ...serverData,
                    source: 'server'
                });
            }
        } catch (error) {
            console.error('Server fetch error:', error);
        }
    };
    
    const saveBatteryDataLocally = async (data) => {
        try {
            const existingData = await AsyncStorage.getItem('battery_history');
            const history = existingData ? JSON.parse(existingData) : [];
            
            history.push(data);
            
            // Limite historique à 1000 points
            if (history.length > 1000) {
                history.splice(0, history.length - 1000);
            }
            
            await AsyncStorage.setItem('battery_history', JSON.stringify(history));
        } catch (error) {
            console.error('Local save error:', error);
        }
    };
    
    const syncWithServer = async () => {
        if (!isOnline) return;
        
        try {
            const localHistory = await AsyncStorage.getItem('battery_history');
            if (localHistory) {
                const history = JSON.parse(localHistory);
                const unsyncedData = history.filter(d => !d.synced);
                
                if (unsyncedData.length > 0) {
                    const token = await AsyncStorage.getItem('auth_token');
                    const response = await fetch('https://api.trackingbms.com/v1/batteries/sync', {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ data: unsyncedData })
                    });
                    
                    if (response.ok) {
                        // Marquer comme synchronisé
                        const updatedHistory = history.map(d => ({
                            ...d,
                            synced: true
                        }));
                        await AsyncStorage.setItem('battery_history', JSON.stringify(updatedHistory));
                    }
                }
            }
        } catch (error) {
            console.error('Sync error:', error);
        }
    };
    
    return (
        <View style={styles.container}>
            <Header 
                connectionMode={connectionMode}
                isOnline={isOnline}
                connectedDevice={connectedDevice}
            />
            
            <ConnectionPanel
                nearbyDevices={nearbyDevices}
                onDeviceSelect={connectToDevice}
                onRefreshScan={startBluetoothScan}
                connectionMode={connectionMode}
            />
            
            <BatteryDataPanel 
                data={batteryData}
                source={batteryData.source}
            />
            
            <ControlPanel
                onSyncServer={syncWithServer}
                onSwitchMode={setConnectionMode}
                isOnline={isOnline}
            />
        </View>
    );
};

export default TrackingBMSMobile;
```

## 🔄 Intégration dans l'Architecture Existante

<function_calls>
<invoke name="TodoWrite">
<parameter name="todos">[{"content": "Analyser architecture communication DalyBMS existante", "status": "completed", "activeForm": "Analyse architecture DalyBMS"}, {"content": "Mettre \u00e0 jour sp\u00e9cifications BMS Connector pour DalyBMS", "status": "in_progress", "activeForm": "Mise \u00e0 jour BMS Connector DalyBMS"}, {"content": "Concevoir \u00e9metteurs multi-protocoles (Bluetooth/WiFi/GPRS)", "status": "pending", "activeForm": "Conception \u00e9metteurs multi-protocoles"}, {"content": "Int\u00e9grer protocoles communication UART/CAN/RS485", "status": "pending", "activeForm": "Int\u00e9gration protocoles communication"}, {"content": "D\u00e9velopper syst\u00e8me connexion directe vs serveur", "status": "pending", "activeForm": "D\u00e9veloppement connexion hybride"}, {"content": "Mettre \u00e0 jour documentation API pour DalyBMS", "status": "pending", "activeForm": "Mise \u00e0 jour documentation API"}]