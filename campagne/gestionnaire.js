        // ========================================
        // CAMPAIGN DATA MANAGEMENT
        // ========================================
        
        let campaignData = {
            name: "Le Coffre-fort oublié",
            description: "Les Gardiens de l'Aurore - Campagne D&D 2024",
            currentNode: "campagne",
            currentPath: ["campagne"],
            
            // HIERARCHICAL STRUCTURE
            structure: {
                campagne: {
                    id: "campagne",
                    label: "Le Coffre-fort oublié",
                    type: "campagne",
                    icon: "fas fa-dragon",
                    description: "Une petite sorcière à l'aura dorée — Petite Lumière — peut guérir une malédiction rampante qui frappe Pré-au-Lard. Pour la sauver et sauver le village, il faut récupérer, dans un ancien coffre-fort de Gringotts effondré, la Relique de l'Aube.",
                    children: ["acte1", "acte2", "acte3"],
                    mapId: "coffre_fort_principal"
                },
                acte1: {
                    id: "acte1",
                    label: "Acte I - Le Goulet",
                    type: "acte",
                    icon: "fas fa-door-open",
                    description: "Sécuriser les dalles, désamorcer 1 piège rune. Point d'entrée dans le coffre-fort effondré.",
                    children: ["spirale", "hall_principal"],
                    mapId: "coffre_fort_entree"
                },
                spirale: {
                    id: "spirale",
                    label: "Escalier en spirale",
                    type: "lieu",
                    icon: "fas fa-stairs",
                    description: "Point d'arrivée du Portoloin. Des runes gobelines jalonnent les marches.",
                    children: [],
                    mapId: "escalier_spirale"
                },
                hall_principal: {
                    id: "hall_principal",
                    label: "Hall principal",
                    type: "lieu",
                    icon: "fas fa-columns",
                    description: "Grand hall d'entrée avec des dalles piégées et des inscriptions gobelines.",
                    children: ["piege_dalle"],
                    mapId: "hall_principal"
                },
                piege_dalle: {
                    id: "piege_dalle",
                    label: "Piège des dalles",
                    type: "piege",
                    icon: "fas fa-exclamation-triangle",
                    description: "Dalles piégées qui s'effondrent si on marche dessus sans prononcer le mot de passe gobelin.",
                    children: [],
                    mapId: null
                },
                acte2: {
                    id: "acte2",
                    label: "Acte II - Les Trois Clefs",
                    type: "acte",
                    icon: "fas fa-key",
                    description: "Choisir 3 salles parmi 4 pour obtenir les glyphes-clefs nécessaires à l'ouverture de la Salle du Cœur.",
                    children: ["vortex_bleu", "prisons_vertes", "autel_rouge", "jardin_fongique"],
                    mapId: "coffre_fort_salles"
                },
                vortex_bleu: {
                    id: "vortex_bleu",
                    label: "Salle du Vortex bleu",
                    type: "salle",
                    icon: "fas fa-water",
                    description: "Une salle remplie d'énergie magique bleue avec un vortex au centre.",
                    children: ["elementaire_eau"],
                    mapId: "vortex_bleu"
                },
                elementaire_eau: {
                    id: "elementaire_eau",
                    label: "Élémentaire d'eau",
                    type: "rencontre",
                    icon: "fas fa-tint",
                    description: "Combat contre un élémentaire d'eau corrompu par la magie du dragon.",
                    children: [],
                    mapId: null
                },
                prisons_vertes: {
                    id: "prisons_vertes",
                    label: "Prisons vertes",
                    type: "salle",
                    icon: "fas fa-bars",
                    description: "D'anciennes cellules gobelines avec une aura verte malfaisante.",
                    children: ["spectre_gobelin"],
                    mapId: "prisons_vertes"
                },
                spectre_gobelin: {
                    id: "spectre_gobelin",
                    label: "Spectre gobelin",
                    type: "rencontre",
                    icon: "fas fa-ghost",
                    description: "L'esprit tourmenté d'un ancien gardien gobelin.",
                    children: [],
                    mapId: null
                },
                autel_rouge: {
                    id: "autel_rouge",
                    label: "Autel rouge",
                    type: "salle",
                    icon: "fas fa-fire",
                    description: "Un autel de sacrifice gobelin encore actif, entouré de flammes rouges.",
                    children: ["gardien_flammes"],
                    mapId: "autel_rouge"
                },
                gardien_flammes: {
                    id: "gardien_flammes",
                    label: "Gardien des flammes",
                    type: "rencontre",
                    icon: "fas fa-fire-alt",
                    description: "Une créature de flammes invoquée par l'autel.",
                    children: [],
                    mapId: null
                },
                jardin_fongique: {
                    id: "jardin_fongique",
                    label: "Jardin fongique",
                    type: "salle",
                    icon: "fas fa-seedling",
                    description: "Un jardin souterrain envahi par des champignons magiques.",
                    children: ["champignons_explosifs"],
                    mapId: "jardin_fongique"
                },
                champignons_explosifs: {
                    id: "champignons_explosifs",
                    label: "Champignons explosifs",
                    type: "rencontre",
                    icon: "fas fa-bomb",
                    description: "Des champignons qui explosent quand on les approche.",
                    children: [],
                    mapId: null
                },
                acte3: {
                    id: "acte3",
                    label: "Acte III - Le Cœur",
                    type: "acte",
                    icon: "fas fa-heart",
                    description: "Rituel Or + Argent dans la Salle du Cœur. Négociation avec le jeune Dragon Vert Gallois.",
                    children: ["salle_coeur", "dragon_vert"],
                    mapId: "salle_coeur"
                },
                salle_coeur: {
                    id: "salle_coeur",
                    label: "Salle du Cœur",
                    type: "lieu",
                    icon: "fas fa-gem",
                    description: "La salle centrale du coffre-fort où se trouve le socle de la Relique de l'Aube.",
                    children: ["relique_aube"],
                    mapId: "salle_coeur"
                },
                relique_aube: {
                    id: "relique_aube",
                    label: "Relique de l'Aube",
                    type: "objet",
                    icon: "fas fa-sun",
                    description: "Artefact magique capable de dissiper la malédiction qui frappe Pré-au-Lard.",
                    children: [],
                    mapId: null
                },
                dragon_vert: {
                    id: "dragon_vert",
                    label: "Jeune Dragon Vert Gallois",
                    type: "rencontre",
                    icon: "fas fa-dragon",
                    description: "Le boss final - un jeune dragon qui s'est enchaîné aux lueurs magiques du coffre-fort.",
                    children: [],
                    mapId: null
                }
            },

            // CHARACTERS (PNJ + PJ)
            characters: {
                petite_lumiere: {
                    id: "petite_lumiere",
                    name: "Petite Lumière",
                    type: "pj",
                    class: "Moine (Voie de la Miséricorde)",
                    race: "Drakéide d'or",
                    background: "Acolyte",
                    level: 1,
                    hp: { current: 10, max: 10 },
                    stats: { ca: 13, for: 12, dex: 16, con: 13, int: 11, sag: 16, cha: 14 },
                    ideals: "Protéger les innocents et apporter la guérison",
                    objectives: "Activer la Relique de l'Aube pour sauver Pré-au-Lard",
                    image: "images/petite_lumiere.jpg",
                    actions: [
                        { name: "Attaque au poing", type: "Attaque", dice: "1d20+5", heal: false },
                        { name: "Souffle d'or", type: "Capacité raciale", dice: "1d20+5", heal: false },
                        { name: "Contact guérisseur", type: "Soins", dice: "1d4", heal: true }
                    ],
                    spellcasting: {
                        ability: 'sag',
                        casterLevel: 4,
                        levels: {
                            0: {
                                slots: 0,
                                slotsUsed: 0,
                                spells: [
                                    { name: "Thaumaturgie", school: "transmutation", damage: "" },
                                    { name: "Assistance", school: "divination", damage: "+1d4 à un jet" },
                                    { name: "Stabilisation", school: "necromancie", damage: "Stabilise mourant" }
                                ]
                            },
                            1: {
                                slots: 4,
                                slotsUsed: 0,
                                spells: [
                                    { name: "Soins", school: "evocation", damage: "1d8+4" },
                                    { name: "Bénédiction", school: "enchantement", damage: "+1d4 aux jets" },
                                    { name: "Sanctuaire", school: "abjuration", damage: "Protection" }
                                ]
                            },
                            2: {
                                slots: 3,
                                slotsUsed: 0,
                                spells: [
                                    { name: "Soins de groupe", school: "evocation", damage: "1d8+4" },
                                    { name: "Protection contre le poison", school: "abjuration", damage: "Résistance poison" }
                                ]
                            }
                        }
                    },
                    inventory: ["Bâton de marche", "Kit d'herboriste", "Symbole sacré", "Potions de soin (3)"]
                },
                bouclier_vivant: {
                    id: "bouclier_vivant",
                    name: "Bouclier Vivant",
                    type: "pj",
                    class: "Paladin (Serment des Anciens)",
                    race: "Goliath des collines",
                    background: "Noble",
                    level: 1,
                    hp: { current: 12, max: 12 },
                    stats: { ca: 18, for: 16, dex: 10, con: 14, int: 11, sag: 12, cha: 15 },
                    ideals: "Protéger les faibles et maintenir l'ordre naturel",
                    objectives: "Servir de bouclier à l'équipe et guider les plus jeunes",
                    image: "images/bouclier_vivant.jpg",
                    actions: [
                        { name: "Attaque d'épée", type: "Attaque", dice: "1d20+5", heal: false },
                        { name: "Châtiment divin", type: "Capacité", dice: "1d20+5", heal: false },
                        { name: "Imposition des mains", type: "Soins", dice: "1d4", heal: true }
                    ],
                    spellcasting: {
                        ability: 'cha',
                        casterLevel: 3,
                        levels: {
                            1: {
                                slots: 3,
                                slotsUsed: 0,
                                spells: [
                                    { name: "Soins", school: "evocation", damage: "1d8+3" },
                                    { name: "Bénédiction", school: "enchantement", damage: "+1d4 aux jets" },
                                    { name: "Châtiment divin", school: "evocation", damage: "2d8 vs morts-vivants/fiélons" }
                                ]
                            }
                        }
                    },
                    inventory: ["Épée longue", "Bouclier", "Armure de mailles", "Trousse noble", "Sceau familial"]
                },
                oeil_percant: {
                    id: "oeil_percant",
                    name: "Œil Perçant",
                    type: "pj",
                    class: "Rôdeur (Traqueur des ténèbres)",
                    race: "Elfe sylvestre",
                    background: "Artiste",
                    level: 1,
                    hp: { current: 11, max: 11 },
                    stats: { ca: 14, for: 13, dex: 16, con: 12, int: 14, sag: 15, cha: 11 },
                    ideals: "Préserver l'équilibre entre civilisation et nature",
                    objectives: "Éliminer les créatures corrompues et protéger la forêt",
                    image: "images/oeil_percant.jpg",
                    actions: [
                        { name: "Attaque d'arc", dice: "1d20+5", damage: "1d8+3" },
                        { name: "Tir de précision", dice: "1d20+7", damage: "1d8+3" },
                        { name: "Marque du chasseur", dice: "1d6", damage: "1d6" }
                    ],
                    inventory: ["Arc long", "Carquois (30 flèches)", "Armure de cuir", "Kit d'artiste", "Instruments"]
                },
                ombre_dansante: {
                    id: "ombre_dansante",
                    name: "Ombre Dansante",
                    type: "pj",
                    class: "Roublard (Psionique)",
                    race: "Elfe noir",
                    background: "Criminel",
                    level: 1,
                    hp: { current: 9, max: 9 },
                    stats: { ca: 13, for: 10, dex: 16, con: 12, int: 15, sag: 13, cha: 14 },
                    ideals: "Utiliser ses talents pour le bien après une vie dans l'ombre",
                    objectives: "Racheter son passé en aidant l'équipe à réussir",
                    image: "images/ombre_dansante.jpg",
                    actions: [
                        { name: "Attaque de dague", dice: "1d20+5", damage: "1d4+3" },
                        { name: "Attaque sournoise", dice: "1d20+5", damage: "1d4+3+1d6" },
                        { name: "Lame psionique", dice: "1d20+5", damage: "1d4+3+1d6" }
                    ],
                    inventory: ["Dagues (2)", "Outils de voleur", "Armure de cuir", "Contacts criminels", "Passe-partout"]
                },
                gardien_secrets: {
                    id: "gardien_secrets",
                    name: "Gardien des Secrets",
                    type: "pj",
                    class: "Magicien (Divination)",
                    race: "Drakéide d'argent",
                    background: "Charlatan",
                    level: 1,
                    hp: { current: 7, max: 7 },
                    stats: { ca: 11, for: 8, dex: 14, con: 13, int: 16, sag: 12, cha: 15 },
                    ideals: "Chercher la vérité cachée et partager les connaissances",
                    objectives: "Utiliser la divination pour guider l'équipe vers le succès",
                    image: "images/gardien_secrets.jpg",
                    actions: [
                        { name: "Attaque de dague", type: "Attaque", dice: "1d20+2", heal: false },
                        { name: "Portent", type: "Capacité", dice: "2d20", heal: false }
                    ],
                    spellcasting: {
                        ability: 'int',
                        casterLevel: 3,
                        levels: {
                            0: {
                                slots: 0,
                                slotsUsed: 0,
                                spells: [
                                    { name: "Trait de feu", school: "evocation", damage: "1d10" },
                                    { name: "Prestidigitation", school: "transmutation", damage: "" },
                                    { name: "Main du mage", school: "conjuration", damage: "" }
                                ]
                            },
                            1: {
                                slots: 4,
                                slotsUsed: 0,
                                spells: [
                                    { name: "Projectile magique", school: "evocation", damage: "1d4+1" },
                                    { name: "Bouclier", school: "abjuration", damage: "+5 CA" },
                                    { name: "Détection de la magie", school: "divination", damage: "" }
                                ]
                            },
                            2: {
                                slots: 2,
                                slotsUsed: 0,
                                spells: [
                                    { name: "Toile d'araignée", school: "conjuration", damage: "Entrave" },
                                    { name: "Scorching Ray", school: "evocation", damage: "2d6" }
                                ]
                            }
                        }
                    },
                    inventory: ["Grimoire", "Focaliseur arcanique", "Outils de charlatan", "Parchemins", "Encre et plume"]
                },
                nackrag: {
                    id: "nackrag",
                    name: "Nackrag l'Estimeur",
                    type: "pnj",
                    class: "Gobelin Sage",
                    race: "Gobelin",
                    background: "Érudit",
                    level: 5,
                    hp: { current: 27, max: 27 },
                    stats: { ca: 15, for: 8, dex: 14, con: 12, int: 18, sag: 15, cha: 13 },
                    ideals: "Préserver les connaissances gobelines ancestrales",
                    objectives: "Aider les héros à récupérer la relique sans détruire le coffre-fort",
                    image: "images/nackrag.jpg",
                    actions: [
                        { name: "Attaque de bâton", type: "Attaque", dice: "1d20+2", heal: false },
                        { name: "Connaissance gobeline", type: "Capacité", dice: "1d20+8", heal: false }
                    ],
                    spellcasting: {
                        ability: 'int',
                        casterLevel: 5,
                        levels: {
                            0: {
                                slots: 0,
                                slotsUsed: 0,
                                spells: [
                                    { name: "Lumière", school: "evocation", damage: "" },
                                    { name: "Réparation", school: "transmutation", damage: "" },
                                    { name: "Détection de la magie", school: "divination", damage: "" }
                                ]
                            },
                            1: {
                                slots: 4,
                                slotsUsed: 0,
                                spells: [
                                    { name: "Identification", school: "divination", damage: "" },
                                    { name: "Compréhension des langues", school: "divination", damage: "" }
                                ]
                            },
                            2: {
                                slots: 3,
                                slotsUsed: 0,
                                spells: [
                                    { name: "Localiser objet", school: "divination", damage: "" },
                                    { name: "Lévitation", school: "transmutation", damage: "" }
                                ]
                            },
                            3: {
                                slots: 2,
                                slotsUsed: 0,
                                spells: [
                                    { name: "Dissipation de la magie", school: "abjuration", damage: "" }
                                ]
                            }
                        }
                    },
                    inventory: ["Bâton ancien", "Cartes du coffre-fort", "Livres gobelines", "Clefs de secours", "Gemmes d'appraisal"]
                }
            },

            // MAPS
            maps: {
                coffre_fort_principal: {
                    id: "coffre_fort_principal",
                    name: "Vue d'ensemble du Coffre-fort",
                    image: "/media/campaign/maps/Carte_Donjon_1.webp",
                    pins: []
                },
                coffre_fort_entree: {
                    id: "coffre_fort_entree",
                    name: "Entrée du Coffre-fort",
                    image: "/media/campaign/maps/Carte_Donjon_1.webp",
                    pins: [
                        { x: 50, y: 80, note: "# Point d'arrivée du Portoloin\n\nLes aventuriers arrivent ici via le **Portoloin** magique.\n\n*L'air crépite d'énergie résiduelle.*" }
                    ]
                },
                salle_coeur: {
                    id: "salle_coeur",
                    name: "Salle du Cœur",
                    image: "/media/campaign/maps/Carte_Donjon_1.webp",
                    pins: [
                        { x: 50, y: 30, note: "# Socle de la Relique de l'Aube\n\n**Objectif principal** : Récupérer l'artefact.\n\n*Émet une lumière dorée pulsante.*" },
                        { x: 70, y: 60, note: "# Repaire du Dragon Vert\n\n⚠️ **DANGER** : Jeune Dragon Vert Gallois\n\n- **FP :** 8\n- **PV :** 136\n- **CA :** 18\n\n*Enchaîné aux lueurs magiques du coffre-fort.*" }
                    ]
                },
                escalier_spirale: {
                    id: "escalier_spirale",
                    name: "Escalier en spirale",
                    image: "/media/campaign/maps/Carte_Donjon_1.webp",
                    pins: []
                },
                hall_principal: {
                    id: "hall_principal",
                    name: "Hall principal",
                    image: "/media/campaign/maps/Carte_Donjon_1.webp",
                    pins: []
                },
                vortex_bleu: {
                    id: "vortex_bleu",
                    name: "Salle du Vortex bleu",
                    image: "/media/campaign/maps/Carte_Donjon_1.webp",
                    pins: []
                },
                prisons_vertes: {
                    id: "prisons_vertes",
                    name: "Prisons vertes",
                    image: "/media/campaign/maps/Carte_Donjon_1.webp",
                    pins: []
                },
                autel_rouge: {
                    id: "autel_rouge",
                    name: "Autel rouge",
                    image: "/media/campaign/maps/Carte_Donjon_1.webp",
                    pins: []
                },
                jardin_fongique: {
                    id: "jardin_fongique",
                    name: "Jardin fongique",
                    image: "/media/campaign/maps/Carte_Donjon_1.webp",
                    pins: []
                },
                coffre_fort_salles: {
                    id: "coffre_fort_salles",
                    name: "Plan des salles",
                    image: "/media/campaign/maps/Carte_Donjon_1.webp",
                    pins: []
                }
            },

            // QUESTS
            quests: {
                mission_principale: {
                    id: "mission_principale",
                    title: "Récupérer la Relique de l'Aube",
                    description: "Traverser le coffre-fort effondré, obtenir les trois glyphes-clefs et récupérer la Relique de l'Aube pour sauver Pré-au-Lard.",
                    status: "active",
                    objectives: [
                        { text: "Sécuriser l'entrée du coffre-fort", completed: false },
                        { text: "Obtenir le premier glyphe-clef", completed: false },
                        { text: "Obtenir le deuxième glyphe-clef", completed: false },
                        { text: "Obtenir le troisième glyphe-clef", completed: false },
                        { text: "Accéder à la Salle du Cœur", completed: false },
                        { text: "Activer la Relique de l'Aube", completed: false },
                        { text: "Négocier avec le dragon", completed: false }
                    ]
                },
                sauver_dragon: {
                    id: "sauver_dragon",
                    title: "Épargner le Jeune Dragon",
                    description: "Éviter l'abattage du dragon et le convaincre de partir en paix.",
                    status: "inactive",
                    objectives: [
                        { text: "Comprendre les motivations du dragon", completed: false },
                        { text: "Trouver un moyen de communication", completed: false },
                        { text: "Proposer un arrangement équitable", completed: false }
                    ]
                }
            },

            // CALENDAR & TIME
            calendar: {
                currentDate: { day: 15, month: 3, year: 1492 },
                events: {
                    "15-3-1492": [
                        { title: "Départ pour le coffre-fort", type: "important" }
                    ],
                    "16-3-1492": [
                        { title: "Retour prévu à Pré-au-Lard", type: "deadline" }
                    ]
                }
            },

        };

        // MAP STATE
        let mapState = {
            rotation: 0,
            rotationLocked: false,
            pinsLocked: false,
            addPinMode: false
        };


        // ========================================
        // INITIALIZATION
        // ========================================
        
        document.addEventListener('DOMContentLoaded', function() {
            loadCampaignState();
            initializeCampaign();
            generateNavigation();
            showContent(campaignData.currentNode);
        });

        function loadCampaignState() {
            try {
                const saved = localStorage.getItem('campaignData_coffre_fort');
                if (saved) {
                    const data = JSON.parse(saved);
                    if (data.mapState) {
                        mapState = { ...mapState, ...data.mapState };
                        // Restaurer l'état visuel au chargement de la carte
                        setTimeout(restoreMapVisualState, 100);
                    }
                }
            } catch (e) {
                console.error('❌ Erreur lors du chargement de l\'état:', e);
            }
        }

        function restoreMapVisualState() {
            const mapWrapper = document.getElementById('mapWrapper');
            if (!mapWrapper) return;

            // Restaurer rotation
            mapWrapper.style.transform = `rotate(${mapState.rotation}deg)`;
            const rotationIndicator = document.getElementById('rotationIndicator');
            if (rotationIndicator) {
                rotationIndicator.textContent = `${mapState.rotation}°`;
            }

            // Restaurer les boutons de verrouillage
            const lockRotationBtn = document.getElementById('lockRotationBtn');
            if (mapState.rotationLocked && lockRotationBtn) {
                lockRotationBtn.classList.add('active');
                lockRotationBtn.querySelector('i').className = 'fas fa-lock';
                lockRotationBtn.title = 'Déverrouiller rotation';
            }

            const lockPinsBtn = document.getElementById('lockPinsBtn');
            if (mapState.pinsLocked && lockPinsBtn) {
                lockPinsBtn.classList.add('active');
                lockPinsBtn.querySelector('i').className = 'fas fa-lock';
                lockPinsBtn.title = 'Déverrouiller épingles';
                
                const mapImage = document.getElementById('mapImage');
                if (mapImage) {
                    mapImage.classList.add('locked');
                }
            }

            const addPinModeBtn = document.getElementById('addPinModeBtn');
            if (mapState.addPinMode && addPinModeBtn) {
                addPinModeBtn.classList.add('active');
                addPinModeBtn.title = 'Désactiver mode ajout';
            }
        }

        function initializeCampaign() {
            // Load saved data if available
            const saved = localStorage.getItem('campaignData_coffre_fort');
            if (saved) {
                try {
                    const savedData = JSON.parse(saved);
                    // Merge with default data to ensure all properties exist
                    campaignData = { ...campaignData, ...savedData };
                } catch (e) {
                    console.error('Error loading saved data:', e);
                }
            }
        }

        // ========================================
        // NAVIGATION SYSTEM
        // ========================================
        
        function generateNavigation() {
            const tree = document.getElementById('campaignTree');
            tree.innerHTML = '';
            
            function createNode(nodeId, level = 0) {
                const node = campaignData.structure[nodeId];
                if (!node) return;
                
                const li = document.createElement('li');
                li.className = 'nav-item';
                
                const hasChildren = node.children && node.children.length > 0;
                if (hasChildren) li.classList.add('has-children');
                
                const label = document.createElement('a');
                label.className = 'nav-label';
                label.innerHTML = `<i class="${node.icon}"></i> ${node.label}`;
                label.onclick = (e) => {
                    e.preventDefault();
                    if (hasChildren) {
                        li.classList.toggle('expanded');
                    }
                    navigateTo(nodeId);
                };
                
                li.appendChild(label);
                
                if (hasChildren) {
                    const childrenContainer = document.createElement('ul');
                    childrenContainer.className = 'nav-children nav-tree';
                    
                    node.children.forEach(childId => {
                        const childNode = createNode(childId, level + 1);
                        if (childNode) childrenContainer.appendChild(childNode);
                    });
                    
                    li.appendChild(childrenContainer);
                }
                
                return li;
            }
            
            const rootNode = createNode('campagne');
            if (rootNode) tree.appendChild(rootNode);
        }

        function navigateTo(nodeId) {
            campaignData.currentNode = nodeId;
            
            // Update active navigation
            document.querySelectorAll('.nav-label').forEach(label => {
                label.classList.remove('active');
            });
            
            const targetLabel = document.querySelector(`[onclick*="${nodeId}"]`);
            if (targetLabel) targetLabel.classList.add('active');
            
            // Update path
            updatePath(nodeId);
            
            // Show content
            showContent(nodeId);
            
            
            // Save state
            saveData();
        }

        function updatePath(nodeId) {
            const path = [];
            let current = nodeId;
            
            // Build path from current to root
            while (current && campaignData.structure[current]) {
                path.unshift(current);
                // Find parent
                let parent = null;
                for (const [id, node] of Object.entries(campaignData.structure)) {
                    if (node.children && node.children.includes(current)) {
                        parent = id;
                        break;
                    }
                }
                current = parent;
            }
            
            campaignData.currentPath = path;
            
            // Update breadcrumb
            const breadcrumb = document.getElementById('breadcrumbPath');
            const pathLabels = path.map(id => campaignData.structure[id]?.label || id);
            breadcrumb.textContent = pathLabels.join(' > ');
        }

        // ========================================
        // CONTENT DISPLAY
        // ========================================
        
        function showContent(nodeId) {
            const node = campaignData.structure[nodeId];
            if (!node) return;
            
            // Update header
            document.getElementById('contentIcon').className = node.icon;
            document.getElementById('contentTitle').textContent = node.label;
            
            // Update overview content
            const overview = document.getElementById('overviewContent');
            overview.innerHTML = `
                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title"><i class="${node.icon}"></i> ${node.label}</h3>
                        <span class="status-indicator status-active"></span>
                    </div>
                    <div class="card-body">
                        <p><strong>Type:</strong> ${node.type}</p>
                        <p><strong>Description:</strong> ${node.description}</p>
                        ${node.children && node.children.length > 0 ? 
                            `<div class="mt-3">
                                <h4>Éléments contenus:</h4>
                                <ul>
                                    ${node.children.map(childId => {
                                        const child = campaignData.structure[childId];
                                        return child ? `<li><i class="${child.icon}"></i> ${child.label}</li>` : '';
                                    }).join('')}
                                </ul>
                            </div>` : ''
                        }
                    </div>
                </div>
            `;
            
            // Update map if available
            if (node.mapId && campaignData.maps[node.mapId]) {
                const mapImg = document.getElementById('mapImage');
                mapImg.src = campaignData.maps[node.mapId].image;
                updateMapPins(node.mapId);
            }
            
            // Update characters
            updateCharactersDisplay();
            
            // Update quests
            updateQuestsDisplay();
            
            // Update inventories
            updateInventoriesDisplay();
            
            // Update calendar
            updateCalendarDisplay();
        }

        // ========================================
        // TAB SYSTEM
        // ========================================
        
        function showTab(tabName) {
            // Update tab buttons
            document.querySelectorAll('.tab-button').forEach(btn => {
                btn.classList.remove('active');
            });
            event.target.classList.add('active');
            
            // Update tab content
            document.querySelectorAll('.tab-content').forEach(content => {
                content.classList.remove('active');
            });
            document.getElementById(tabName).classList.add('active');
        }

        // ========================================
        // CHARACTERS SYSTEM
        // ========================================
        
        function updateCharactersDisplay() {
            const grid = document.getElementById('charactersGrid');
            grid.innerHTML = '';
            
            Object.values(campaignData.characters).forEach(character => {
                const card = createCharacterCard(character);
                grid.appendChild(card);
            });
        }

        function createCharacterCard(character) {
            const div = document.createElement('div');
            div.className = 'character-card';
            
            const hpPercent = (character.hp.current / character.hp.max) * 100;
            
            div.innerHTML = `
                <div class="character-header">
                    <div class="character-avatar">
                        <i class="fas ${character.type === 'pj' ? 'fa-user-tie' : 'fa-user'}"></i>
                    </div>
                    <div class="character-info">
                        <h4>${character.name}</h4>
                        <p>${character.race} - ${character.class}</p>
                        <small class="text-muted">${character.type.toUpperCase()} Niveau ${character.level}</small>
                    </div>
                </div>
                
                <div class="stats-row">
                    <div class="stat-item">
                        <span class="stat-value">${character.stats.ca}</span>
                        <div class="stat-label">CA</div>
                    </div>
                    <div class="stat-item">
                        <span class="stat-value">${character.stats.for}</span>
                        <div class="stat-label">FOR</div>
                    </div>
                    <div class="stat-item">
                        <span class="stat-value">${character.stats.dex}</span>
                        <div class="stat-label">DEX</div>
                    </div>
                </div>
                
                <div class="hp-bar">
                    <div class="hp-fill" style="width: ${hpPercent}%"></div>
                    <div class="hp-text">${character.hp.current}/${character.hp.max} PV</div>
                </div>
                
                <div class="card-body">
                    <p><strong>Idéaux:</strong> ${character.ideals}</p>
                    <p><strong>Objectifs:</strong> ${character.objectives}</p>
                </div>
                
                <div class="actions-list">
                    <h5><i class="fas fa-sword"></i> Actions</h5>
                    ${character.actions.map(action => `
                        <div class="action-item">
                            <span>${action.name}</span>
                            <button class="dice-btn" onclick="rollAction('${character.id}', '${action.name}', '${action.dice}')">
                                <i class="fas fa-dice-d20"></i>
                            </button>
                        </div>
                    `).join('')}
                </div>
                
                ${character.spellcasting ? `
                    <div class="spells-list">
                        <h5><i class="fas fa-magic"></i> Sorts</h5>
                        <div class="spell-ability-info">
                            <small class="text-info">
                                ${character.spellcasting.ability === 'int' ? 'Intelligence' : 
                                  character.spellcasting.ability === 'sag' ? 'Sagesse' : 'Charisme'} 
                                - Niveau ${character.spellcasting.casterLevel}
                            </small>
                        </div>
                        ${Object.entries(character.spellcasting.levels).map(([level, data]) => {
                            const levelName = level == 0 ? 'Tours de magie' : `Niveau ${level}`;
                            const hasSpells = data.spells && data.spells.length > 0;
                            
                            if (!hasSpells) return '';
                            
                            return `
                                <div class="spell-level-display">
                                    <div class="spell-level-header-mini">
                                        <strong>${levelName}</strong>
                                        ${level > 0 ? `<span class="text-info">(${data.slots - data.slotsUsed}/${data.slots})</span>` : ''}
                                    </div>
                                    <div class="spells-grid">
                                        ${data.spells.map((spell, index) => `
                                            <div class="spell-mini">
                                                <span class="spell-name">${spell.name}</span>
                                                <button class="dice-btn spell-cast-mini" 
                                                        onclick="${level == 0 ? `castCantrip('${character.id}', ${index})` : `castSpell('${character.id}', ${level}, ${index})`}"
                                                        ${level > 0 && data.slotsUsed >= data.slots ? 'disabled' : ''}>
                                                    <i class="fas fa-magic"></i>
                                                </button>
                                            </div>
                                        `).join('')}
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                ` : ''}
                
                <div class="mt-3">
                    <button class="btn btn-info" onclick="editCharacter('${character.id}')">
                        <i class="fas fa-edit"></i> Modifier
                    </button>
                    <button class="btn btn-warning" onclick="adjustHP('${character.id}')">
                        <i class="fas fa-heart"></i> PV
                    </button>
                </div>
            `;
            
            return div;
        }

        // ========================================
        // DICE ROLLING SYSTEM
        // ========================================
        
        function rollAction(characterId, actionName, diceExpression) {
            const result = rollDice(diceExpression);
            
            // Show animated result
            showDiceResult(result.total);
            
            // Log result
            console.log(`${actionName}: ${diceExpression} = ${result.details} = ${result.total}`);
            
            // Update character if it's healing
            const character = campaignData.characters[characterId];
            const action = character.actions.find(a => a.name === actionName);
            if (action && action.heal) {
                character.hp.current = Math.min(character.hp.max, character.hp.current + result.total);
                updateCharactersDisplay();
                saveData();
            }
        }

        function rollDice(expression) {
            // Parse dice expression (e.g., "1d20+5", "2d6", "1d4+3")
            const match = expression.match(/(\d+)d(\d+)([+\-]\d+)?/);
            if (!match) return { total: 0, details: "Invalid dice expression" };
            
            const numDice = parseInt(match[1]);
            const diceType = parseInt(match[2]);
            const modifier = match[3] ? parseInt(match[3]) : 0;
            
            const rolls = [];
            let total = modifier;
            
            for (let i = 0; i < numDice; i++) {
                const roll = Math.floor(Math.random() * diceType) + 1;
                rolls.push(roll);
                total += roll;
            }
            
            const details = `[${rolls.join(', ')}]${modifier !== 0 ? ` ${modifier > 0 ? '+' : ''}${modifier}` : ''}`;
            
            return { total, details };
        }

        function showDiceResult(result) {
            const resultDiv = document.createElement('div');
            resultDiv.className = 'dice-result';
            resultDiv.textContent = result;
            
            document.body.appendChild(resultDiv);
            
            setTimeout(() => {
                document.body.removeChild(resultDiv);
            }, 800);
        }

        // ========================================
        // MAP SYSTEM
        // ========================================
        
        function updateMapPins(mapId) {
            const mapData = campaignData.maps[mapId];
            if (!mapData) return;
            
            const pinsContainer = document.getElementById('mapPins');
            pinsContainer.innerHTML = '';
            
            mapData.pins.forEach((pin, index) => {
                const pinDiv = document.createElement('div');
                pinDiv.className = 'map-pin';
                
                // Apply locked state
                if (mapState.pinsLocked || pin.locked) {
                    pinDiv.classList.add('locked');
                }
                
                pinDiv.style.left = `${pin.x}%`;
                pinDiv.style.top = `${pin.y}%`;
                pinDiv.dataset.mapId = mapId;
                pinDiv.dataset.pinIndex = index;
                
                pinDiv.innerHTML = `
                    <div class="pin-tooltip">
                        <div class="pin-tooltip-content">${parseMarkdown(pin.note)}</div>
                    </div>
                    <div class="delete-btn" onclick="deleteMapPin(event, '${mapId}', ${index})" title="Supprimer">×</div>
                `;
                
                // Double-click pour éditer la note
                pinDiv.ondblclick = () => editMapPin(mapId, index);
                
                // Right-click pour verrouiller/déverrouiller individuellement
                pinDiv.oncontextmenu = (e) => {
                    e.preventDefault();
                    togglePinLock(mapId, index);
                };
                
                // Rendre l'épingle draggable
                makePinDraggable(pinDiv, mapId, index);
                
                pinsContainer.appendChild(pinDiv);
            });
        }

        function togglePinLock(mapId, pinIndex) {
            const pin = campaignData.maps[mapId].pins[pinIndex];
            pin.locked = !pin.locked;
            updateMapPins(mapId);
            saveData();
        }

        function addMapPin(event) {
            // Check if pins are locked
            if (mapState.pinsLocked && event) {
                return; // Prevent adding pins when locked
            }
            
            const mapContainer = document.querySelector('.map-container');
            const mapImg = document.getElementById('mapImage');
            
            if (!mapImg.src) {
                alert('Aucune carte sélectionnée');
                return;
            }
            
            // Get current map ID from the current node
            const currentNode = campaignData.structure[campaignData.currentNode];
            const currentMapId = currentNode && currentNode.mapId ? currentNode.mapId : null;
            
            if (!currentMapId || !campaignData.maps[currentMapId]) {
                alert('Aucune carte associée à cette section');
                return;
            }
            
            // Calculate position from click event if provided
            let x = 50, y = 50;
            if (event && event.clientX && event.clientY) {
                const rect = mapImg.getBoundingClientRect();
                x = ((event.clientX - rect.left) / rect.width) * 100;
                y = ((event.clientY - rect.top) / rect.height) * 100;
            }
            
            showNoteEditor('# Nouvelle Note\n\nÉcrivez votre note ici...', (note) => {
                if (note && note.trim()) {
                    const pin = { 
                        x, 
                        y, 
                        note,
                        locked: false // New pins are unlocked by default
                    };
                    campaignData.maps[currentMapId].pins.push(pin);
                    updateMapPins(currentMapId);
                    saveData();
                }
            });
        }

        function makePinDraggable(pinElement, mapId, pinIndex) {
            let isDragging = false;
            let startX, startY;
            let initialLeft, initialTop;
            
            pinElement.addEventListener('mousedown', startDrag);
            
            function startDrag(e) {
                // Ignorer si c'est sur le bouton de suppression
                if (e.target.classList.contains('delete-btn')) return;
                
                // Ignorer si l'épingle ou les épingles globalement sont verrouillées
                const pin = campaignData.maps[mapId].pins[pinIndex];
                if (mapState.pinsLocked || pin.locked || pinElement.classList.contains('locked')) return;
                
                isDragging = true;
                pinElement.classList.add('dragging');
                
                // Position initiale de la souris
                startX = e.clientX;
                startY = e.clientY;
                
                // Position initiale de l'épingle
                const rect = pinElement.getBoundingClientRect();
                const parentRect = pinElement.parentElement.getBoundingClientRect();
                initialLeft = ((rect.left + rect.width/2 - parentRect.left) / parentRect.width) * 100;
                initialTop = ((rect.top + rect.height/2 - parentRect.top) / parentRect.height) * 100;
                
                document.addEventListener('mousemove', drag);
                document.addEventListener('mouseup', stopDrag);
                
                e.preventDefault();
            }
            
            function drag(e) {
                if (!isDragging) return;
                
                const deltaX = e.clientX - startX;
                const deltaY = e.clientY - startY;
                
                const parentRect = pinElement.parentElement.getBoundingClientRect();
                const deltaXPercent = (deltaX / parentRect.width) * 100;
                const deltaYPercent = (deltaY / parentRect.height) * 100;
                
                let newX = initialLeft + deltaXPercent;
                let newY = initialTop + deltaYPercent;
                
                // Contraindre dans les limites de la carte
                newX = Math.max(2, Math.min(98, newX));
                newY = Math.max(2, Math.min(98, newY));
                
                pinElement.style.left = `${newX}%`;
                pinElement.style.top = `${newY}%`;
            }
            
            function stopDrag(e) {
                if (!isDragging) return;
                
                isDragging = false;
                pinElement.classList.remove('dragging');
                
                // Sauvegarder la nouvelle position
                const pin = campaignData.maps[mapId].pins[pinIndex];
                pin.x = parseFloat(pinElement.style.left);
                pin.y = parseFloat(pinElement.style.top);
                
                saveData();
                
                document.removeEventListener('mousemove', drag);
                document.removeEventListener('mouseup', stopDrag);
            }
        }
        
        function deleteMapPin(event, mapId, pinIndex) {
            event.stopPropagation();
            if (confirm('Supprimer cette épingle ?')) {
                campaignData.maps[mapId].pins.splice(pinIndex, 1);
                updateMapPins(mapId);
                saveData();
            }
        }

        function editMapPin(mapId, pinIndex) {
            const pin = campaignData.maps[mapId].pins[pinIndex];
            showNoteEditor(pin.note, (updatedNote) => {
                if (updatedNote !== null && updatedNote !== undefined) {
                    pin.note = updatedNote;
                    updateMapPins(mapId);
                    saveData();
                }
            });
        }

        function clearMapPins() {
            const currentNode = campaignData.structure[campaignData.currentNode];
            if (currentNode && currentNode.mapId && campaignData.maps[currentNode.mapId]) {
                if (confirm('Effacer toutes les notes de cette carte ?')) {
                    campaignData.maps[currentNode.mapId].pins = [];
                    updateMapPins(currentNode.mapId);
                    saveData();
                }
            }
        }

        // ========================================
        // MAP ROTATION & CONTROLS
        // ========================================

        function rotateMap(degrees) {
            if (mapState.rotationLocked) return;
            
            mapState.rotation = (mapState.rotation + degrees) % 360;
            if (mapState.rotation < 0) mapState.rotation += 360;
            
            const mapWrapper = document.getElementById('mapWrapper');
            mapWrapper.style.transform = `rotate(${mapState.rotation}deg)`;
            
            // Update rotation indicator
            document.getElementById('rotationIndicator').textContent = `${mapState.rotation}°`;
            
            saveData();
        }

        function toggleRotationLock() {
            mapState.rotationLocked = !mapState.rotationLocked;
            const lockBtn = document.getElementById('lockRotationBtn');
            const icon = lockBtn.querySelector('i');
            
            if (mapState.rotationLocked) {
                lockBtn.classList.add('active');
                icon.className = 'fas fa-lock';
                lockBtn.title = 'Déverrouiller rotation';
            } else {
                lockBtn.classList.remove('active');
                icon.className = 'fas fa-unlock';
                lockBtn.title = 'Verrouiller rotation';
            }
            
            saveData();
        }

        function toggleAddPinMode() {
            mapState.addPinMode = !mapState.addPinMode;
            const addBtn = document.getElementById('addPinModeBtn');
            const mapImage = document.getElementById('mapImage');
            
            if (mapState.addPinMode) {
                addBtn.classList.add('active');
                addBtn.title = 'Désactiver mode ajout';
                mapImage.style.cursor = 'copy';
            } else {
                addBtn.classList.remove('active');
                addBtn.title = 'Mode ajout épingles';
                mapImage.style.cursor = mapState.pinsLocked ? 'not-allowed' : 'crosshair';
            }
        }

        function togglePinsLock() {
            mapState.pinsLocked = !mapState.pinsLocked;
            const lockBtn = document.getElementById('lockPinsBtn');
            const icon = lockBtn.querySelector('i');
            const mapImage = document.getElementById('mapImage');
            
            if (mapState.pinsLocked) {
                lockBtn.classList.add('active');
                icon.className = 'fas fa-lock';
                lockBtn.title = 'Déverrouiller épingles';
                mapImage.classList.add('locked');
                
                // Lock all existing pins
                document.querySelectorAll('.map-pin').forEach(pin => {
                    pin.classList.add('locked');
                });
            } else {
                lockBtn.classList.remove('active');
                icon.className = 'fas fa-unlock-alt';
                lockBtn.title = 'Verrouiller épingles';
                mapImage.classList.remove('locked');
                
                // Unlock all existing pins
                document.querySelectorAll('.map-pin').forEach(pin => {
                    pin.classList.remove('locked');
                });
            }
            
            saveData();
        }

        function resetMapView() {
            mapState.rotation = 0;
            mapState.rotationLocked = false;
            mapState.pinsLocked = false;
            mapState.addPinMode = false;
            
            // Reset visual state
            const mapWrapper = document.getElementById('mapWrapper');
            mapWrapper.style.transform = 'rotate(0deg)';
            document.getElementById('rotationIndicator').textContent = '0°';
            
            // Reset buttons
            document.getElementById('lockRotationBtn').classList.remove('active');
            document.getElementById('lockRotationBtn').querySelector('i').className = 'fas fa-unlock';
            document.getElementById('addPinModeBtn').classList.remove('active');
            document.getElementById('lockPinsBtn').classList.remove('active');
            document.getElementById('lockPinsBtn').querySelector('i').className = 'fas fa-unlock-alt';
            
            // Reset map image
            const mapImage = document.getElementById('mapImage');
            mapImage.classList.remove('locked');
            mapImage.style.cursor = 'crosshair';
            
            // Unlock all pins
            document.querySelectorAll('.map-pin').forEach(pin => {
                pin.classList.remove('locked');
            });
            
            saveData();
        }

        // ========================================
        // QUEST SYSTEM
        // ========================================
        
        function updateQuestsDisplay() {
            const questsList = document.getElementById('questsList');
            questsList.innerHTML = '';
            
            Object.values(campaignData.quests).forEach(quest => {
                const card = createQuestCard(quest);
                questsList.appendChild(card);
            });
        }

        function createQuestCard(quest) {
            const div = document.createElement('div');
            div.className = 'card';
            
            const completedObjectives = quest.objectives.filter(obj => obj.completed).length;
            const totalObjectives = quest.objectives.length;
            const progress = (completedObjectives / totalObjectives) * 100;
            
            div.innerHTML = `
                <div class="card-header">
                    <h3 class="card-title">
                        <i class="fas fa-scroll"></i> ${quest.title}
                        <span class="status-indicator status-${quest.status}"></span>
                    </h3>
                    <div class="card-actions">
                        <button class="btn btn-info" onclick="editQuest('${quest.id}')">
                            <i class="fas fa-edit"></i>
                        </button>
                    </div>
                </div>
                <div class="card-body">
                    <p>${quest.description}</p>
                    <div class="mt-3">
                        <div class="d-flex justify-content-between align-items-center mb-2">
                            <strong>Objectifs</strong>
                            <span class="text-info">${completedObjectives}/${totalObjectives}</span>
                        </div>
                        <div class="hp-bar">
                            <div class="hp-fill" style="width: ${progress}%; background: linear-gradient(90deg, var(--info-color), var(--success-color))"></div>
                        </div>
                        <ul class="mt-2">
                            ${quest.objectives.map((obj, index) => `
                                <li style="color: ${obj.completed ? 'var(--success-color)' : 'var(--text-color)'}">
                                    <input type="checkbox" ${obj.completed ? 'checked' : ''} 
                                           onchange="toggleObjective('${quest.id}', ${index})">
                                    ${obj.text}
                                    ${obj.completed ? '<i class="fas fa-check text-success ml-2"></i>' : ''}
                                </li>
                            `).join('')}
                        </ul>
                    </div>
                </div>
            `;
            
            return div;
        }

        function toggleObjective(questId, objectiveIndex) {
            const quest = campaignData.quests[questId];
            if (quest && quest.objectives[objectiveIndex]) {
                quest.objectives[objectiveIndex].completed = !quest.objectives[objectiveIndex].completed;
                updateQuestsDisplay();
                saveData();
            }
        }

        function editQuest(questId) {
            const quest = campaignData.quests[questId];
            if (!quest) return;
            
            const content = `
                <div class="editor-section">
                    <h4><i class="fas fa-scroll"></i> Informations de Quête</h4>
                    <div class="form-group">
                        <label>Titre</label>
                        <input type="text" class="form-input" id="questTitle" value="${quest.title}">
                    </div>
                    <div class="form-group">
                        <label>Description</label>
                        <textarea class="form-input" id="questDescription" rows="3">${quest.description}</textarea>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label>Status</label>
                            <select class="form-input" id="questStatus">
                                <option value="active" ${quest.status === 'active' ? 'selected' : ''}>Active</option>
                                <option value="completed" ${quest.status === 'completed' ? 'selected' : ''}>Complétée</option>
                                <option value="failed" ${quest.status === 'failed' ? 'selected' : ''}>Échouée</option>
                                <option value="paused" ${quest.status === 'paused' ? 'selected' : ''}>En pause</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Priorité</label>
                            <select class="form-input" id="questPriority">
                                <option value="low">Basse</option>
                                <option value="medium" ${!quest.priority || quest.priority === 'medium' ? 'selected' : ''}>Moyenne</option>
                                <option value="high" ${quest.priority === 'high' ? 'selected' : ''}>Haute</option>
                                <option value="critical" ${quest.priority === 'critical' ? 'selected' : ''}>Critique</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div class="editor-section">
                    <h4><i class="fas fa-tasks"></i> Objectifs</h4>
                    <div class="actions-editor" id="objectivesEditor">
                        ${quest.objectives.map((objective, index) => `
                            <div class="action-editor-item">
                                <label>
                                    <input type="checkbox" ${objective.completed ? 'checked' : ''} data-field="completed" data-index="${index}">
                                    Complété
                                </label>
                                <input type="text" placeholder="Description de l'objectif" value="${objective.description}" data-field="description" data-index="${index}" style="flex: 2;">
                                <button type="button" class="remove-action-btn" onclick="removeObjective(${index})">×</button>
                            </div>
                        `).join('')}
                    </div>
                    <button type="button" class="btn btn-info mt-2" onclick="addNewObjective()">
                        <i class="fas fa-plus"></i> Ajouter Objectif
                    </button>
                </div>

                <div class="mt-3 text-center">
                    <button class="btn btn-success" onclick="saveQuestEdit('${questId}')">
                        <i class="fas fa-save"></i> Sauvegarder
                    </button>
                    <button class="btn" onclick="closeModal()">
                        <i class="fas fa-times"></i> Annuler
                    </button>
                </div>
            `;
            
            const modal = document.getElementById('modalOverlay').querySelector('.modal');
            modal.classList.add('character-editor');
            
            showModal(`Éditer Quête - ${quest.title}`, content);
        }

        function saveQuestEdit(questId) {
            const quest = campaignData.quests[questId];
            
            // Basic info
            quest.title = document.getElementById('questTitle').value;
            quest.description = document.getElementById('questDescription').value;
            quest.status = document.getElementById('questStatus').value;
            quest.priority = document.getElementById('questPriority').value;
            
            // Objectives
            const objectiveItems = document.querySelectorAll('#objectivesEditor .action-editor-item');
            quest.objectives = [];
            objectiveItems.forEach((item, index) => {
                const objective = {
                    description: item.querySelector('[data-field="description"]').value,
                    completed: item.querySelector('[data-field="completed"]').checked
                };
                if (objective.description.trim()) {
                    quest.objectives.push(objective);
                }
            });
            
            updateQuestsDisplay();
            closeModal();
            saveData();
        }

        function addNewObjective() {
            const editor = document.getElementById('objectivesEditor');
            const newIndex = editor.children.length;
            
            const newObjectiveHTML = `
                <div class="action-editor-item">
                    <label>
                        <input type="checkbox" data-field="completed" data-index="${newIndex}">
                        Complété
                    </label>
                    <input type="text" placeholder="Description de l'objectif" value="" data-field="description" data-index="${newIndex}" style="flex: 2;">
                    <button type="button" class="remove-action-btn" onclick="removeObjective(${newIndex})">×</button>
                </div>
            `;
            
            editor.insertAdjacentHTML('beforeend', newObjectiveHTML);
        }

        function removeObjective(index) {
            const objectiveItems = document.querySelectorAll('#objectivesEditor .action-editor-item');
            if (objectiveItems[index]) {
                objectiveItems[index].remove();
            }
        }

        // ========================================
        // INVENTORY SYSTEM
        // ========================================
        
        function updateInventoriesDisplay() {
            updateNPCInventories();
            updatePCInventories();
        }

        function updateNPCInventories() {
            const container = document.getElementById('npcInventories');
            container.innerHTML = '';
            
            Object.values(campaignData.characters)
                .filter(char => char.type === 'pnj')
                .forEach(npc => {
                    const inventoryDiv = createInventoryDisplay(npc);
                    container.appendChild(inventoryDiv);
                });
        }

        function updatePCInventories() {
            const container = document.getElementById('pcInventories');
            container.innerHTML = '';
            
            Object.values(campaignData.characters)
                .filter(char => char.type === 'pj')
                .forEach(pc => {
                    const inventoryDiv = createInventoryDisplay(pc);
                    container.appendChild(inventoryDiv);
                });
        }

        function createInventoryDisplay(character) {
            const div = document.createElement('div');
            div.className = 'card';
            
            div.innerHTML = `
                <div class="card-header">
                    <h4 class="card-title">
                        <i class="fas ${character.type === 'pj' ? 'fa-user-tie' : 'fa-user'}"></i>
                        ${character.name}
                    </h4>
                    <button class="btn btn-success btn-sm" onclick="addItem('${character.id}')">
                        <i class="fas fa-plus"></i>
                    </button>
                </div>
                <div class="inventory-grid">
                    ${character.inventory.map((item, index) => `
                        <div class="inventory-item" onclick="selectItem('${character.id}', ${index})" id="item-${character.id}-${index}">
                            <div>${item}</div>
                        </div>
                    `).join('')}
                </div>
            `;
            
            return div;
        }

        let selectedItems = [];

        function selectItem(characterId, itemIndex) {
            const itemId = `item-${characterId}-${itemIndex}`;
            const itemElement = document.getElementById(itemId);
            
            const existingSelection = selectedItems.find(s => s.characterId === characterId && s.itemIndex === itemIndex);
            
            if (existingSelection) {
                // Remove selection
                selectedItems = selectedItems.filter(s => s !== existingSelection);
                itemElement.classList.remove('selected');
            } else {
                // Add selection
                selectedItems.push({ characterId, itemIndex });
                itemElement.classList.add('selected');
            }
        }

        function transferItems() {
            if (selectedItems.length === 0) {
                alert('Veuillez sélectionner des objets à transférer');
                return;
            }
            
            const targetId = prompt('ID du personnage destinataire:');
            const targetChar = campaignData.characters[targetId];
            
            if (!targetChar) {
                alert('Personnage destinataire non trouvé');
                return;
            }
            
            // Transfer items
            selectedItems.forEach(selection => {
                const sourceChar = campaignData.characters[selection.characterId];
                const item = sourceChar.inventory[selection.itemIndex];
                
                // Remove from source
                sourceChar.inventory.splice(selection.itemIndex, 1);
                
                // Add to target
                targetChar.inventory.push(item);
            });
            
            selectedItems = [];
            updateInventoriesDisplay();
            saveData();
            
            alert(`${selectedItems.length} objet(s) transféré(s) vers ${targetChar.name}`);
        }

        function addItem(characterId) {
            const item = prompt('Nom de l\'objet à ajouter:');
            if (item) {
                campaignData.characters[characterId].inventory.push(item);
                updateInventoriesDisplay();
                saveData();
            }
        }

        // ========================================
        // CALENDAR SYSTEM
        // ========================================
        
        function updateCalendarDisplay() {
            const calendar = campaignData.calendar;
            const grid = document.getElementById('calendarGrid');
            const title = document.getElementById('calendarTitle');
            
            const monthNames = [
                'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
                'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
            ];
            
            title.textContent = `${monthNames[calendar.currentDate.month - 1]} ${calendar.currentDate.year}`;
            
            // Generate calendar days
            grid.innerHTML = '';
            
            // Day headers
            const dayHeaders = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
            dayHeaders.forEach(day => {
                const headerDiv = document.createElement('div');
                headerDiv.style.fontWeight = 'bold';
                headerDiv.style.textAlign = 'center';
                headerDiv.style.padding = '10px';
                headerDiv.style.background = 'var(--primary-color)';
                headerDiv.textContent = day;
                grid.appendChild(headerDiv);
            });
            
            // Calendar days (simplified - just show current month)
            for (let day = 1; day <= 30; day++) {
                const dayDiv = document.createElement('div');
                dayDiv.className = 'calendar-day';
                
                if (day === calendar.currentDate.day) {
                    dayDiv.classList.add('current');
                }
                
                const dateKey = `${day}-${calendar.currentDate.month}-${calendar.currentDate.year}`;
                if (calendar.events[dateKey]) {
                    dayDiv.classList.add('has-event');
                    dayDiv.title = calendar.events[dateKey].map(e => e.title).join(', ');
                }
                
                dayDiv.textContent = day;
                dayDiv.onclick = () => selectDate(day);
                
                grid.appendChild(dayDiv);
            }
        }

        function selectDate(day) {
            campaignData.calendar.currentDate.day = day;
            updateCalendarDisplay();
            saveData();
        }

        function changeMonth(delta) {
            campaignData.calendar.currentDate.month += delta;
            if (campaignData.calendar.currentDate.month > 12) {
                campaignData.calendar.currentDate.month = 1;
                campaignData.calendar.currentDate.year++;
            } else if (campaignData.calendar.currentDate.month < 1) {
                campaignData.calendar.currentDate.month = 12;
                campaignData.calendar.currentDate.year--;
            }
            updateCalendarDisplay();
            saveData();
        }

        function addEvent() {
            const title = prompt('Titre de l\'événement:');
            if (title) {
                const { day, month, year } = campaignData.calendar.currentDate;
                const dateKey = `${day}-${month}-${year}`;
                
                if (!campaignData.calendar.events[dateKey]) {
                    campaignData.calendar.events[dateKey] = [];
                }
                
                campaignData.calendar.events[dateKey].push({
                    title,
                    type: 'custom'
                });
                
                updateCalendarDisplay();
                saveData();
            }
        }

        function shortRest() {
            // Advance time by 1 hour
            alert('Repos court effectué - 1 heure s\'est écoulée');
            
            // Restore some HP to all PCs
            Object.values(campaignData.characters)
                .filter(char => char.type === 'pj')
                .forEach(pc => {
                    const healAmount = Math.floor(pc.level / 2) + 1;
                    pc.hp.current = Math.min(pc.hp.max, pc.hp.current + healAmount);
                });
            
            updateCharactersDisplay();
            saveData();
        }

        function longRest() {
            // Advance time by 8 hours
            alert('Repos long effectué - 8 heures se sont écoulées');
            
            // Restore full HP to all PCs
            Object.values(campaignData.characters)
                .filter(char => char.type === 'pj')
                .forEach(pc => {
                    pc.hp.current = pc.hp.max;
                });
            
            updateCharactersDisplay();
            saveData();
        }


        // ========================================
        // MARKDOWN EDITOR SYSTEM
        // ========================================
        
        function showNoteEditor(initialContent = '', onSave = null) {
            const content = `
                <div class="markdown-toolbar">
                    <button class="markdown-btn" data-before="**" data-after="**" title="Gras">
                        <i class="fas fa-bold"></i>
                    </button>
                    <button class="markdown-btn" data-before="*" data-after="*" title="Italique">
                        <i class="fas fa-italic"></i>
                    </button>
                    <button class="markdown-btn" data-before="# " data-after="" title="Titre 1">
                        H1
                    </button>
                    <button class="markdown-btn" data-before="## " data-after="" title="Titre 2">
                        H2
                    </button>
                    <button class="markdown-btn" data-before="### " data-after="" title="Titre 3">
                        H3
                    </button>
                    <button class="markdown-btn" data-before="- " data-after="" title="Liste">
                        <i class="fas fa-list-ul"></i>
                    </button>
                    <button class="markdown-btn" data-before="1. " data-after="" title="Liste numérotée">
                        <i class="fas fa-list-ol"></i>
                    </button>
                    <button class="markdown-btn" data-before="> " data-after="" title="Citation">
                        <i class="fas fa-quote-right"></i>
                    </button>
                    <button class="markdown-btn" data-action="code" title="Code">
                        <i class="fas fa-code"></i>
                    </button>
                    <button class="markdown-btn" data-before="![Image](" data-after=")" title="Image">
                        <i class="fas fa-image"></i>
                    </button>
                    <button class="markdown-btn" data-before="[Lien](" data-after=")" title="Lien">
                        <i class="fas fa-link"></i>
                    </button>
                    <button class="markdown-btn" data-action="hr" title="Ligne horizontale">
                        <i class="fas fa-minus"></i>
                    </button>
                    <button class="markdown-btn" data-action="center" title="Centrer">
                        <i class="fas fa-align-center"></i>
                    </button>
                    <button class="markdown-btn" data-action="table" title="Tableau">
                        <i class="fas fa-table"></i>
                    </button>
                    <button class="markdown-btn" data-action="upload" title="Upload Image">
                        <i class="fas fa-upload"></i>
                    </button>
                </div>
                <div class="markdown-editor">
                    <textarea class="markdown-input" id="markdownInput" placeholder="Rédigez votre note en Markdown...">${initialContent}</textarea>
                    <div class="markdown-preview" id="markdownPreview"></div>
                </div>
                <div class="mt-3 text-center">
                    <button class="btn btn-success" onclick="saveMarkdownNote()">
                        <i class="fas fa-save"></i> Sauvegarder
                    </button>
                    <button class="btn" onclick="closeModal()">
                        <i class="fas fa-times"></i> Annuler
                    </button>
                </div>
            `;
            
            const modal = document.getElementById('modalOverlay').querySelector('.modal');
            modal.classList.add('note-modal');
            
            showModal('Éditeur de Note Markdown', content);
            
            // Initialiser l'éditeur
            const input = document.getElementById('markdownInput');
            const preview = document.getElementById('markdownPreview');
            
            // Fonction de sauvegarde pour le callback
            window.currentNoteSaveCallback = onSave;
            
            // Mettre à jour la prévisualisation en temps réel
            function updatePreview() {
                preview.innerHTML = parseMarkdown(input.value);
            }
            
            input.addEventListener('input', updatePreview);
            input.addEventListener('scroll', () => {
                // Synchroniser le scroll entre l'éditeur et la prévisualisation
                const scrollPercent = input.scrollTop / (input.scrollHeight - input.clientHeight);
                preview.scrollTop = scrollPercent * (preview.scrollHeight - preview.clientHeight);
            });
            
            // Ajouter les gestionnaires d'événements pour les boutons
            document.querySelectorAll('.markdown-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    const before = btn.getAttribute('data-before');
                    const after = btn.getAttribute('data-after');
                    const action = btn.getAttribute('data-action');
                    
                    if (before !== null && after !== null) {
                        insertMarkdown(before, after);
                    } else if (action) {
                        handleToolbarAction(action);
                    }
                });
            });
            
            // Prévisualisation initiale
            updatePreview();
            
            // Focus sur l'éditeur
            setTimeout(() => input.focus(), 100);
        }
        
        function insertMarkdown(before, after) {
            const input = document.getElementById('markdownInput');
            const start = input.selectionStart;
            const end = input.selectionEnd;
            const selectedText = input.value.substring(start, end);
            
            const newText = before + selectedText + after;
            
            input.value = input.value.substring(0, start) + newText + input.value.substring(end);
            
            // Repositionner le curseur
            const newCursorPos = start + before.length + selectedText.length;
            input.setSelectionRange(newCursorPos, newCursorPos);
            
            input.focus();
            
            // Mettre à jour la prévisualisation
            const preview = document.getElementById('markdownPreview');
            preview.innerHTML = parseMarkdown(input.value);
        }
        
        function handleToolbarAction(action) {
            switch (action) {
                case 'code':
                    insertMarkdown('\n```\n', '\n```\n');
                    break;
                case 'hr':
                    insertMarkdown('\n---\n', '');
                    break;
                case 'center':
                    insertMarkdown('\n<div class="center">\n\n', '\n\n</div>\n');
                    break;
                case 'table':
                    insertTable();
                    break;
                case 'upload':
                    uploadImage();
                    break;
            }
        }
        
        function insertTable() {
            const table = '\n| Colonne 1 | Colonne 2 | Colonne 3 |\n|-----------|-----------|-----------|\n| Cellule 1 | Cellule 2 | Cellule 3 |\n| Cellule 4 | Cellule 5 | Cellule 6 |\n';
            insertMarkdown(table, '');
        }
        
        function uploadImage() {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = 'image/*';
            input.onchange = (e) => {
                const file = e.target.files[0];
                if (!file) return;
                
                const reader = new FileReader();
                reader.onload = (e) => {
                    const imageData = e.target.result;
                    const imageName = file.name;
                    insertMarkdown(`![${imageName}](${imageData})`, '');
                };
                reader.readAsDataURL(file);
            };
            input.click();
        }
        
        function saveMarkdownNote() {
            const input = document.getElementById('markdownInput');
            const noteContent = input.value;
            
            if (window.currentNoteSaveCallback) {
                window.currentNoteSaveCallback(noteContent);
                window.currentNoteSaveCallback = null;
            }
            
            closeModal();
        }
        
        function parseMarkdown(markdown) {
            if (!markdown) return '';
            
            let html = markdown;
            
            // Échapper le HTML existant
            html = html.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
            
            // Blocs de code (avant autres transformations)
            html = html.replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>');
            html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
            
            // Titres
            html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
            html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
            html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');
            
            // Gras et italique
            html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
            html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');
            
            // Liens
            html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>');
            
            // Images
            html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" />');
            
            // Listes non ordonnées
            html = html.replace(/^[*+-] (.*)$/gim, '<li>$1</li>');
            html = html.replace(/((<li>.*<\/li>\s*)+)/g, '<ul>$1</ul>');
            
            // Listes ordonnées
            html = html.replace(/^\d+\. (.*)$/gim, '<li>$1</li>');
            
            // Citations
            html = html.replace(/^> (.*)$/gim, '<blockquote>$1</blockquote>');
            
            // Lignes horizontales
            html = html.replace(/^---$/gim, '<hr>');
            
            // Tableaux simples
            const lines = html.split('\n');
            let newLines = [];
            let inTable = false;
            
            for (let i = 0; i < lines.length; i++) {
                const line = lines[i];
                if (line.match(/^\|(.+)\|$/)) {
                    const cells = line.split('|').slice(1, -1).map(cell => cell.trim());
                    const isHeaderSeparator = cells.every(cell => cell.match(/^-+$/));
                    
                    if (isHeaderSeparator) {
                        continue; // Ignorer les lignes de séparation
                    }
                    
                    if (!inTable) {
                        newLines.push('<table>');
                        inTable = true;
                    }
                    
                    const cellTags = cells.map(cell => `<td>${cell}</td>`).join('');
                    newLines.push(`<tr>${cellTags}</tr>`);
                } else {
                    if (inTable) {
                        newLines.push('</table>');
                        inTable = false;
                    }
                    newLines.push(line);
                }
            }
            
            if (inTable) {
                newLines.push('</table>');
            }
            
            html = newLines.join('\n');
            
            // Paragraphes
            html = html.replace(/\n\n/g, '</p><p>');
            html = '<p>' + html + '</p>';
            
            // Nettoyer les paragraphes vides et les éléments mal formés
            html = html.replace(/<p><\/p>/g, '');
            html = html.replace(/<p>\s*<\/p>/g, '');
            html = html.replace(/<p>(<h[1-6]>)/g, '$1');
            html = html.replace(/(<\/h[1-6]>)<\/p>/g, '$1');
            html = html.replace(/<p>(<ul>)/g, '$1');
            html = html.replace(/(<\/ul>)<\/p>/g, '$1');
            html = html.replace(/<p>(<blockquote>)/g, '$1');
            html = html.replace(/(<\/blockquote>)<\/p>/g, '$1');
            html = html.replace(/<p>(<table>)/g, '$1');
            html = html.replace(/(<\/table>)<\/p>/g, '$1');
            html = html.replace(/<p>(<hr>)<\/p>/g, '$1');
            html = html.replace(/<p>(<pre>)/g, '$1');
            html = html.replace(/(<\/pre>)<\/p>/g, '$1');
            
            // Gérer les divs de centrage
            html = html.replace(/&lt;div class="center"&gt;/g, '<div class="center">');
            html = html.replace(/&lt;\/div&gt;/g, '</div>');
            html = html.replace(/<p>(<div class="center">)/g, '$1');
            html = html.replace(/(<\/div>)<\/p>/g, '$1');
            
            return html;
        }
        
        // ========================================
        // MODAL SYSTEM
        // ========================================
        
        function showModal(title, content) {
            document.getElementById('modalTitle').textContent = title;
            document.getElementById('modalBody').innerHTML = content;
            document.getElementById('modalOverlay').classList.add('active');
        }

        function closeModal() {
            document.getElementById('modalOverlay').classList.remove('active');
            // Réinitialiser les classes du modal
            const modal = document.getElementById('modalOverlay').querySelector('.modal');
            modal.classList.remove('note-modal', 'character-editor');
            // Nettoyer le callback de sauvegarde
            window.currentNoteSaveCallback = null;
        }

        function showAddModal() {
            const content = `
                <div class="form-group">
                    <label class="form-label">Type d'élément</label>
                    <select class="form-select" id="addType">
                        <option value="lieu">Lieu</option>
                        <option value="pnj">PNJ</option>
                        <option value="objet">Objet</option>
                        <option value="quete">Quête</option>
                        <option value="evenement">Événement</option>
                    </select>
                </div>
                <div class="form-group">
                    <label class="form-label">Nom</label>
                    <input type="text" class="form-input" id="addName">
                </div>
                <div class="form-group">
                    <label class="form-label">Description</label>
                    <textarea class="form-input form-textarea" id="addDescription"></textarea>
                </div>
                <div class="mt-3">
                    <button class="btn btn-success" onclick="addElement()">Ajouter</button>
                    <button class="btn" onclick="closeModal()">Annuler</button>
                </div>
            `;
            
            showModal('Ajouter un élément', content);
        }

        function addElement() {
            const type = document.getElementById('addType').value;
            const name = document.getElementById('addName').value;
            const description = document.getElementById('addDescription').value;
            
            if (!name.trim()) {
                alert('Veuillez saisir un nom');
                return;
            }
            
            // Generate unique ID
            const id = name.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
            
            // Add to appropriate data structure
            if (type === 'lieu' || type === 'objet') {
                campaignData.structure[id] = {
                    id,
                    label: name,
                    type,
                    icon: type === 'lieu' ? 'fas fa-map-marker-alt' : 'fas fa-box',
                    description,
                    children: [],
                    mapId: null
                };
                
                // Add to current node's children
                const currentNode = campaignData.structure[campaignData.currentNode];
                if (currentNode) {
                    currentNode.children.push(id);
                }
                
                generateNavigation();
            } else if (type === 'quete') {
                campaignData.quests[id] = {
                    id,
                    title: name,
                    description,
                    status: 'active',
                    objectives: []
                };
                updateQuestsDisplay();
            } else if (type === 'pnj') {
                campaignData.characters[id] = {
                    id,
                    name: name,
                    type: 'pnj',
                    race: 'Inconnu',
                    class: 'Inconnu',
                    level: 1,
                    hp: { current: 20, max: 20 },
                    stats: { ca: 10, for: 10, dex: 10, con: 10, int: 10, sag: 10, cha: 10 },
                    ideals: description,
                    objectives: '',
                    actions: [
                        { name: 'Attaque de base', type: 'Attaque', dice: '1d4', heal: false }
                    ],
                    inventory: []
                };
                updateCharactersDisplay();
            } else if (type === 'evenement') {
                const { day, month, year } = campaignData.calendar.currentDate;
                const dateKey = `${day}-${month}-${year}`;
                
                if (!campaignData.calendar.events[dateKey]) {
                    campaignData.calendar.events[dateKey] = [];
                }
                campaignData.calendar.events[dateKey].push({
                    title: name,
                    description: description
                });
                updateCalendarDisplay();
            }
            
            closeModal();
            saveData();
        }

        // Character editing functions
        function editCharacter(characterId) {
            const character = campaignData.characters[characterId];
            if (!character) return;
            
            const content = `
                <div class="editor-section">
                    <h4><i class="fas fa-user"></i> Informations de Base</h4>
                    <div class="form-row">
                        <div class="form-group">
                            <label>Nom</label>
                            <input type="text" class="form-input" id="charName" value="${character.name}">
                        </div>
                        <div class="form-group">
                            <label>Type</label>
                            <select class="form-input" id="charType">
                                <option value="pj" ${character.type === 'pj' ? 'selected' : ''}>Joueur (PJ)</option>
                                <option value="pnj" ${character.type === 'pnj' ? 'selected' : ''}>Non-Joueur (PNJ)</option>
                            </select>
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label>Race</label>
                            <input type="text" class="form-input" id="charRace" value="${character.race}">
                        </div>
                        <div class="form-group">
                            <label>Classe</label>
                            <input type="text" class="form-input" id="charClass" value="${character.class}">
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label>Niveau</label>
                            <input type="number" class="form-input" id="charLevel" value="${character.level}" min="1" max="20">
                        </div>
                        <div class="form-group">
                            <label>CA (Classe d'Armure)</label>
                            <input type="number" class="form-input" id="charCA" value="${character.stats.ca}">
                        </div>
                    </div>
                </div>

                <div class="editor-section">
                    <h4><i class="fas fa-heart"></i> Points de Vie</h4>
                    <div class="form-row">
                        <div class="form-group">
                            <label>PV Maximum</label>
                            <input type="number" class="form-input" id="charHPMax" value="${character.hp.max}">
                        </div>
                        <div class="form-group">
                            <label>PV Actuels</label>
                            <input type="number" class="form-input" id="charHPCurrent" value="${character.hp.current}">
                        </div>
                    </div>
                </div>

                <div class="editor-section">
                    <h4><i class="fas fa-dice-d20"></i> Caractéristiques</h4>
                    <div class="stats-grid">
                        <div class="stat-editor">
                            <label>FORCE</label>
                            <input type="number" id="charSTR" value="${character.stats.for}" min="1" max="30">
                        </div>
                        <div class="stat-editor">
                            <label>DEXTÉRITÉ</label>
                            <input type="number" id="charDEX" value="${character.stats.dex}" min="1" max="30">
                        </div>
                        <div class="stat-editor">
                            <label>CONSTITUTION</label>
                            <input type="number" id="charCON" value="${character.stats.con}" min="1" max="30">
                        </div>
                        <div class="stat-editor">
                            <label>INTELLIGENCE</label>
                            <input type="number" id="charINT" value="${character.stats.int || 10}" min="1" max="30">
                        </div>
                        <div class="stat-editor">
                            <label>SAGESSE</label>
                            <input type="number" id="charWIS" value="${character.stats.sag || 10}" min="1" max="30">
                        </div>
                        <div class="stat-editor">
                            <label>CHARISME</label>
                            <input type="number" id="charCHA" value="${character.stats.cha || 10}" min="1" max="30">
                        </div>
                    </div>
                </div>

                <div class="editor-section">
                    <h4><i class="fas fa-scroll"></i> Personnalité</h4>
                    <div class="form-group">
                        <label>Idéaux</label>
                        <textarea class="form-input" id="charIdeals" rows="2">${character.ideals}</textarea>
                    </div>
                    <div class="form-group">
                        <label>Objectifs</label>
                        <textarea class="form-input" id="charObjectives" rows="2">${character.objectives}</textarea>
                    </div>
                </div>

                <div class="editor-section">
                    <h4><i class="fas fa-sword"></i> Actions</h4>
                    <div class="actions-editor" id="actionsEditor">
                        ${character.actions.map((action, index) => `
                            <div class="action-editor-item">
                                <input type="text" placeholder="Nom de l'action" value="${action.name}" data-field="name" data-index="${index}">
                                <input type="text" placeholder="Type" value="${action.type || ''}" data-field="type" data-index="${index}">
                                <input type="text" placeholder="Dés" value="${action.dice}" data-field="dice" data-index="${index}">
                                <label><input type="checkbox" ${action.heal ? 'checked' : ''} data-field="heal" data-index="${index}"> Soin</label>
                                <button type="button" class="remove-action-btn" onclick="removeAction(${index})">×</button>
                            </div>
                        `).join('')}
                    </div>
                    <button type="button" class="btn btn-info mt-2" onclick="addNewAction()">
                        <i class="fas fa-plus"></i> Ajouter Action
                    </button>
                </div>

                <div class="editor-section">
                    <h4><i class="fas fa-magic"></i> Sorts & Magie</h4>
                    <div class="form-row">
                        <div class="form-group">
                            <label>Caractéristique de sort</label>
                            <select class="form-input" id="charSpellAbility">
                                <option value="int" ${(character.spellcasting && character.spellcasting.ability === 'int') ? 'selected' : ''}>Intelligence</option>
                                <option value="sag" ${(character.spellcasting && character.spellcasting.ability === 'sag') ? 'selected' : ''}>Sagesse</option>
                                <option value="cha" ${(character.spellcasting && character.spellcasting.ability === 'cha') ? 'selected' : ''}>Charisme</option>
                                <option value="none" ${!character.spellcasting || character.spellcasting.ability === 'none' ? 'selected' : ''}>Aucune</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Niveau de lanceur</label>
                            <input type="number" class="form-input" id="charCasterLevel" value="${character.spellcasting ? character.spellcasting.casterLevel : 0}" min="0" max="20">
                        </div>
                    </div>
                    <div class="spells-editor" id="spellsEditor">
                        ${generateSpellLevelsEditor(character)}
                    </div>
                    <button type="button" class="btn btn-info mt-2" onclick="addSpellLevel()">
                        <i class="fas fa-plus"></i> Ajouter Niveau de Sort
                    </button>
                </div>

                <div class="mt-3 text-center">
                    <button class="btn btn-success" onclick="saveCharacterEdit('${characterId}')">
                        <i class="fas fa-save"></i> Sauvegarder
                    </button>
                    <button class="btn" onclick="closeModal()">
                        <i class="fas fa-times"></i> Annuler
                    </button>
                </div>
            `;
            
            const modal = document.getElementById('modalOverlay').querySelector('.modal');
            modal.classList.add('character-editor');
            
            showModal(`Éditer - ${character.name}`, content);
        }

        function generateSpellLevelsEditor(character) {
            const spellcasting = character.spellcasting || { levels: {} };
            let html = '';
            
            for (let level = 0; level <= 9; level++) {
                const spellLevel = spellcasting.levels[level] || { slots: 0, slotsUsed: 0, spells: [] };
                const levelName = level === 0 ? 'Tours de magie' : `Niveau ${level}`;
                
                html += `
                    <div class="spell-level-section">
                        <div class="spell-level-header" onclick="toggleSpellLevel(${level})">
                            <span>${levelName} (${spellLevel.spells.length} sorts)</span>
                            <i class="fas fa-chevron-down" id="spell-chevron-${level}"></i>
                        </div>
                        <div class="spell-level-content" id="spell-content-${level}">
                            ${level > 0 ? `
                                <div class="spell-slots">
                                    <label>Emplacements :</label>
                                    <input type="number" min="0" max="20" value="${spellLevel.slots}" 
                                           data-level="${level}" data-field="slots" onchange="updateSpellSlots(${level})">
                                    <label>Utilisés :</label>
                                    <input type="number" min="0" max="${spellLevel.slots}" value="${spellLevel.slotsUsed}" 
                                           data-level="${level}" data-field="slotsUsed" onchange="updateSpellSlots(${level})">
                                    <span class="text-info">(${spellLevel.slots - spellLevel.slotsUsed} restants)</span>
                                </div>
                            ` : ''}
                            <div id="spells-list-${level}">
                                ${spellLevel.spells.map((spell, index) => `
                                    <div class="spell-item">
                                        <input type="text" placeholder="Nom du sort" value="${spell.name}" 
                                               data-level="${level}" data-index="${index}" data-field="name">
                                        <select data-level="${level}" data-index="${index}" data-field="school">
                                            <option value="abjuration" ${spell.school === 'abjuration' ? 'selected' : ''}>Abjuration</option>
                                            <option value="conjuration" ${spell.school === 'conjuration' ? 'selected' : ''}>Conjuration</option>
                                            <option value="divination" ${spell.school === 'divination' ? 'selected' : ''}>Divination</option>
                                            <option value="enchantement" ${spell.school === 'enchantement' ? 'selected' : ''}>Enchantement</option>
                                            <option value="evocation" ${spell.school === 'evocation' ? 'selected' : ''}>Évocation</option>
                                            <option value="illusion" ${spell.school === 'illusion' ? 'selected' : ''}>Illusion</option>
                                            <option value="necromancie" ${spell.school === 'necromancie' ? 'selected' : ''}>Nécromancie</option>
                                            <option value="transmutation" ${spell.school === 'transmutation' ? 'selected' : ''}>Transmutation</option>
                                        </select>
                                        <input type="text" placeholder="Dégâts/Effet" value="${spell.damage || ''}" 
                                               data-level="${level}" data-index="${index}" data-field="damage">
                                        ${level > 0 ? `
                                            <button type="button" class="spell-cast-btn" onclick="castSpell(${level}, ${index})" 
                                                    ${spellLevel.slotsUsed >= spellLevel.slots ? 'disabled' : ''}>
                                                Lancer
                                            </button>
                                        ` : `
                                            <button type="button" class="spell-cast-btn" onclick="castCantrip(${index})">
                                                Lancer
                                            </button>
                                        `}
                                        <button type="button" class="remove-action-btn" onclick="removeSpell(${level}, ${index})">×</button>
                                    </div>
                                `).join('')}
                            </div>
                            <button type="button" class="btn btn-info btn-sm mt-2" onclick="addNewSpell(${level})">
                                <i class="fas fa-plus"></i> Ajouter Sort
                            </button>
                        </div>
                    </div>
                `;
            }
            
            return html;
        }

        function toggleSpellLevel(level) {
            const content = document.getElementById(`spell-content-${level}`);
            const chevron = document.getElementById(`spell-chevron-${level}`);
            
            if (content.classList.contains('active')) {
                content.classList.remove('active');
                chevron.className = 'fas fa-chevron-down';
            } else {
                content.classList.add('active');
                chevron.className = 'fas fa-chevron-up';
            }
        }

        function updateSpellSlots(level) {
            const slotsInput = document.querySelector(`[data-level="${level}"][data-field="slots"]`);
            const usedInput = document.querySelector(`[data-level="${level}"][data-field="slotsUsed"]`);
            
            if (slotsInput && usedInput) {
                const slots = parseInt(slotsInput.value);
                const used = parseInt(usedInput.value);
                
                // Update max for used slots
                usedInput.setAttribute('max', slots);
                
                // Update remaining display
                const remainingSpan = usedInput.parentElement.querySelector('.text-info');
                if (remainingSpan) {
                    remainingSpan.textContent = `(${Math.max(0, slots - used)} restants)`;
                }
                
                // Update cast buttons state
                const castButtons = document.querySelectorAll(`[onclick*="castSpell(${level}"]`);
                castButtons.forEach(btn => {
                    btn.disabled = used >= slots;
                });
            }
        }

        function addNewSpell(level) {
            const spellsList = document.getElementById(`spells-list-${level}`);
            const spellsCount = spellsList.children.length;
            
            const newSpellHTML = `
                <div class="spell-item">
                    <input type="text" placeholder="Nom du sort" value="" 
                           data-level="${level}" data-index="${spellsCount}" data-field="name">
                    <select data-level="${level}" data-index="${spellsCount}" data-field="school">
                        <option value="abjuration">Abjuration</option>
                        <option value="conjuration">Conjuration</option>
                        <option value="divination">Divination</option>
                        <option value="enchantement">Enchantement</option>
                        <option value="evocation" selected>Évocation</option>
                        <option value="illusion">Illusion</option>
                        <option value="necromancie">Nécromancie</option>
                        <option value="transmutation">Transmutation</option>
                    </select>
                    <input type="text" placeholder="Dégâts/Effet" value="" 
                           data-level="${level}" data-index="${spellsCount}" data-field="damage">
                    ${level > 0 ? `
                        <button type="button" class="spell-cast-btn" onclick="castSpell(${level}, ${spellsCount})">
                            Lancer
                        </button>
                    ` : `
                        <button type="button" class="spell-cast-btn" onclick="castCantrip(${spellsCount})">
                            Lancer
                        </button>
                    `}
                    <button type="button" class="remove-action-btn" onclick="removeSpell(${level}, ${spellsCount})">×</button>
                </div>
            `;
            
            spellsList.insertAdjacentHTML('beforeend', newSpellHTML);
        }

        function removeSpell(level, index) {
            const spellItems = document.querySelectorAll(`#spells-list-${level} .spell-item`);
            if (spellItems[index]) {
                spellItems[index].remove();
            }
        }

        function castSpell(level, index) {
            const spellName = document.querySelector(`[data-level="${level}"][data-index="${index}"][data-field="name"]`).value;
            const spellDamage = document.querySelector(`[data-level="${level}"][data-index="${index}"][data-field="damage"]`).value;
            const usedInput = document.querySelector(`[data-level="${level}"][data-field="slotsUsed"]`);
            
            if (!spellName) {
                alert('Le sort doit avoir un nom');
                return;
            }
            
            // Use a spell slot
            const currentUsed = parseInt(usedInput.value);
            const maxSlots = parseInt(usedInput.getAttribute('max'));
            
            if (currentUsed >= maxSlots) {
                alert('Plus d\'emplacements de sort de ce niveau !');
                return;
            }
            
            usedInput.value = currentUsed + 1;
            updateSpellSlots(level);
            
            // Roll damage/effect if specified
            let result = `🔮 **${spellName}** (Niveau ${level}) lancé !`;
            
            if (spellDamage) {
                if (spellDamage.match(/\d+d\d+/)) {
                    const diceResult = rollDice(spellDamage);
                    result += `\n💥 Effet : ${diceResult.total} (${diceResult.breakdown})`;
                } else {
                    result += `\n✨ Effet : ${spellDamage}`;
                }
            }
            
            showDiceResult({ breakdown: result, total: '' });
        }

        function castCantrip(index) {
            const spellName = document.querySelector(`[data-level="0"][data-index="${index}"][data-field="name"]`).value;
            const spellDamage = document.querySelector(`[data-level="0"][data-index="${index}"][data-field="damage"]`).value;
            
            if (!spellName) {
                alert('Le tour de magie doit avoir un nom');
                return;
            }
            
            // Roll damage/effect if specified
            let result = `✨ **${spellName}** (Tour de magie) lancé !`;
            
            if (spellDamage) {
                if (spellDamage.match(/\d+d\d+/)) {
                    const diceResult = rollDice(spellDamage);
                    result += `\n💥 Effet : ${diceResult.total} (${diceResult.breakdown})`;
                } else {
                    result += `\n✨ Effet : ${spellDamage}`;
                }
            }
            
            showDiceResult({ breakdown: result, total: '' });
        }

        // Functions for casting spells from character cards
        function castSpell(characterId, level, spellIndex) {
            const character = campaignData.characters[characterId];
            if (!character || !character.spellcasting || !character.spellcasting.levels[level]) return;
            
            const spellLevel = character.spellcasting.levels[level];
            const spell = spellLevel.spells[spellIndex];
            
            if (!spell) return;
            
            // Check spell slots
            if (spellLevel.slotsUsed >= spellLevel.slots) {
                alert(`Plus d'emplacements de sort de niveau ${level} !`);
                return;
            }
            
            // Use spell slot
            spellLevel.slotsUsed++;
            
            // Roll damage/effect if specified
            let result = `🔮 **${spell.name}** (Niveau ${level}) lancé par ${character.name} !`;
            
            if (spell.damage) {
                if (spell.damage.match(/\d+d\d+/)) {
                    const diceResult = rollDice(spell.damage);
                    result += `\n💥 Effet : ${diceResult.total} (${diceResult.breakdown})`;
                } else {
                    result += `\n✨ Effet : ${spell.damage}`;
                }
            }
            
            showDiceResult({ breakdown: result, total: '' });
            updateCharactersDisplay(); // Refresh to show updated spell slots
            saveData();
        }

        function castCantrip(characterId, spellIndex) {
            const character = campaignData.characters[characterId];
            if (!character || !character.spellcasting || !character.spellcasting.levels[0]) return;
            
            const spell = character.spellcasting.levels[0].spells[spellIndex];
            if (!spell) return;
            
            // Roll damage/effect if specified
            let result = `✨ **${spell.name}** (Tour de magie) lancé par ${character.name} !`;
            
            if (spell.damage) {
                if (spell.damage.match(/\d+d\d+/)) {
                    const diceResult = rollDice(spell.damage);
                    result += `\n💥 Effet : ${diceResult.total} (${diceResult.breakdown})`;
                } else {
                    result += `\n✨ Effet : ${spell.damage}`;
                }
            }
            
            showDiceResult({ breakdown: result, total: '' });
        }

        function saveCharacterEdit(characterId) {
            const character = campaignData.characters[characterId];
            
            // Basic info
            character.name = document.getElementById('charName').value;
            character.type = document.getElementById('charType').value;
            character.race = document.getElementById('charRace').value;
            character.class = document.getElementById('charClass').value;
            character.level = parseInt(document.getElementById('charLevel').value);
            
            // Stats
            character.stats.ca = parseInt(document.getElementById('charCA').value);
            character.stats.for = parseInt(document.getElementById('charSTR').value);
            character.stats.dex = parseInt(document.getElementById('charDEX').value);
            character.stats.con = parseInt(document.getElementById('charCON').value);
            character.stats.int = parseInt(document.getElementById('charINT').value);
            character.stats.sag = parseInt(document.getElementById('charWIS').value);
            character.stats.cha = parseInt(document.getElementById('charCHA').value);
            
            // HP
            character.hp.max = parseInt(document.getElementById('charHPMax').value);
            character.hp.current = parseInt(document.getElementById('charHPCurrent').value);
            
            // Personality
            character.ideals = document.getElementById('charIdeals').value;
            character.objectives = document.getElementById('charObjectives').value;
            
            // Actions
            const actionItems = document.querySelectorAll('.action-editor-item');
            character.actions = [];
            actionItems.forEach((item, index) => {
                const action = {
                    name: item.querySelector('[data-field="name"]').value,
                    type: item.querySelector('[data-field="type"]').value,
                    dice: item.querySelector('[data-field="dice"]').value,
                    heal: item.querySelector('[data-field="heal"]').checked
                };
                if (action.name && action.dice) {
                    character.actions.push(action);
                }
            });
            
            // Spellcasting
            const spellAbility = document.getElementById('charSpellAbility').value;
            const casterLevel = parseInt(document.getElementById('charCasterLevel').value);
            
            if (spellAbility !== 'none' && casterLevel > 0) {
                character.spellcasting = {
                    ability: spellAbility,
                    casterLevel: casterLevel,
                    levels: {}
                };
                
                // Save each spell level
                for (let level = 0; level <= 9; level++) {
                    const spellItems = document.querySelectorAll(`[data-level="${level}"]`);
                    const levelSpells = [];
                    let slots = 0;
                    let slotsUsed = 0;
                    
                    // Get slots info
                    if (level > 0) {
                        const slotsInput = document.querySelector(`[data-level="${level}"][data-field="slots"]`);
                        const usedInput = document.querySelector(`[data-level="${level}"][data-field="slotsUsed"]`);
                        if (slotsInput) slots = parseInt(slotsInput.value) || 0;
                        if (usedInput) slotsUsed = parseInt(usedInput.value) || 0;
                    }
                    
                    // Get spells
                    const spellNames = document.querySelectorAll(`[data-level="${level}"][data-field="name"]`);
                    spellNames.forEach((nameInput, index) => {
                        const spell = {
                            name: nameInput.value,
                            school: document.querySelector(`[data-level="${level}"][data-index="${index}"][data-field="school"]`)?.value || 'evocation',
                            damage: document.querySelector(`[data-level="${level}"][data-index="${index}"][data-field="damage"]`)?.value || ''
                        };
                        if (spell.name.trim()) {
                            levelSpells.push(spell);
                        }
                    });
                    
                    if (levelSpells.length > 0 || slots > 0) {
                        character.spellcasting.levels[level] = {
                            slots: slots,
                            slotsUsed: slotsUsed,
                            spells: levelSpells
                        };
                    }
                }
            } else {
                // Remove spellcasting if not a caster
                delete character.spellcasting;
            }
            
            updateCharactersDisplay();
            closeModal();
            saveData();
        }

        function addNewAction() {
            const editor = document.getElementById('actionsEditor');
            const newIndex = editor.children.length;
            
            const newActionHTML = `
                <div class="action-editor-item">
                    <input type="text" placeholder="Nom de l'action" value="" data-field="name" data-index="${newIndex}">
                    <input type="text" placeholder="Type" value="" data-field="type" data-index="${newIndex}">
                    <input type="text" placeholder="Dés (ex: 1d8+3)" value="" data-field="dice" data-index="${newIndex}">
                    <label><input type="checkbox" data-field="heal" data-index="${newIndex}"> Soin</label>
                    <button type="button" class="remove-action-btn" onclick="removeAction(${newIndex})">×</button>
                </div>
            `;
            
            editor.insertAdjacentHTML('beforeend', newActionHTML);
        }

        function removeAction(index) {
            const actionItems = document.querySelectorAll('.action-editor-item');
            if (actionItems[index]) {
                actionItems[index].remove();
            }
        }

        // HP adjustment modal handling
        const hpModal = document.getElementById('hpModal');
        const hpForm = document.getElementById('hpModalForm');
        const hpInput = document.getElementById('hpValue');
        let hpAdjustCharacterId = null;

        if (hpModal && hpForm && hpInput) {
            document.getElementById('hpPlus').addEventListener('click', () => {
                hpInput.value = parseInt(hpInput.value || '0') + 1;
            });

            document.getElementById('hpMinus').addEventListener('click', () => {
                hpInput.value = parseInt(hpInput.value || '0') - 1;
            });

            document.getElementById('hpCancel').addEventListener('click', () => {
                hpModal.style.display = 'none';
                hpAdjustCharacterId = null;
            });

            hpForm.addEventListener('submit', function(e) {
                e.preventDefault();
                const value = parseInt(hpInput.value);
                if (!isNaN(value) && hpAdjustCharacterId) {
                    const character = campaignData.characters[hpAdjustCharacterId];
                    character.hp.current = Math.max(0, Math.min(character.hp.max, character.hp.current + value));
                    updateCharactersDisplay();
                    saveData();
                }
                hpModal.style.display = 'none';
                hpAdjustCharacterId = null;
            });
        }

        function adjustHP(characterId) {
            if (hpModal && hpInput) {
                hpAdjustCharacterId = characterId;
                hpInput.value = 0;
                hpModal.style.display = 'flex';
            }
        }

        // ========================================
        // DATA MANAGEMENT
        // ========================================
        
        function saveData() {
            try {
                const dataToSave = {
                    ...campaignData,
                    mapState: mapState
                };
                localStorage.setItem('campaignData_coffre_fort', JSON.stringify(dataToSave));
                console.log('✅ Données sauvegardées (incluant état carte)');
            } catch (e) {
                console.error('❌ Erreur de sauvegarde:', e);
                alert('Erreur lors de la sauvegarde des données');
            }
        }

        function loadData() {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = '.json';
            input.onchange = (e) => {
                const file = e.target.files[0];
                if (!file) return;
                
                const reader = new FileReader();
                reader.onload = (e) => {
                    try {
                        const data = JSON.parse(e.target.result);
                        campaignData = { ...campaignData, ...data };
                        
                        // Reinitialize everything
                        generateNavigation();
                        showContent(campaignData.currentNode);
                        
                        alert('✅ Données chargées avec succès');
                    } catch (err) {
                        alert('❌ Erreur lors du chargement du fichier');
                        console.error(err);
                    }
                };
                reader.readAsText(file);
            };
            input.click();
        }

        // Auto-save every 30 seconds
        setInterval(saveData, 30000);

        // Save on page unload
        window.addEventListener('beforeunload', saveData);

        // ========================================
        // UTILITY FUNCTIONS
        // ========================================
        
        // Click outside modal to close
        document.getElementById('modalOverlay').addEventListener('click', function(e) {
            if (e.target === this) {
                closeModal();
            }
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                closeModal();
            }
            
            if (e.ctrlKey && e.key === 's') {
                e.preventDefault();
                saveData();
            }
        });

        console.log('🎮 Gestionnaire de Campagne - Le Coffre-fort oublié initialisé');
        console.log('🎵 Système de musique contextuel activé');
        console.log('💾 Sauvegarde automatique activée');
