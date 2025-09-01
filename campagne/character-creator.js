(function() {
    const abilities = ['for', 'dex', 'con', 'int', 'sag', 'cha'];
    const abilityLabels = { for: 'FOR', dex: 'DEX', con: 'CON', int: 'INT', sag: 'SAG', cha: 'CHA' };
    const classHitDice = {
        barbare: 12,
        barbarian: 12,
        guerrier: 10,
        fighter: 10,
        paladin: 10,
        rodeur: 10,
        ranger: 10,
        barde: 8,
        bard: 8,
        clerc: 8,
        cleric: 8,
        druide: 8,
        druid: 8,
        moine: 8,
        monk: 8,
        roublard: 8,
        rogue: 8,
        voleur: 8,
        warlock: 8,
        ensorceleur: 6,
        sorcerer: 6,
        sorcier: 6,
        wizard: 6,
        magicien: 6,
        artificier: 8,
        artificer: 8
    };

    let abilityScores = {};
    let abilityModifiers = {};

    function roll4d6DropLowest() {
        const rolls = [];
        for (let i = 0; i < 4; i++) {
            rolls.push(Math.floor(Math.random() * 6) + 1);
        }
        const total = rolls.sort((a, b) => a - b).slice(1).reduce((a, b) => a + b, 0);
        return { rolls, total };
    }

    function rollAbilities() {
        const resultsDiv = document.getElementById('abilitiesResults');
        resultsDiv.innerHTML = '';
        abilityScores = {};
        abilityModifiers = {};

        abilities.forEach(ab => {
            const { rolls, total } = roll4d6DropLowest();
            abilityScores[ab] = total;
            const mod = Math.floor((total - 10) / 2);
            abilityModifiers[ab] = mod;
            const rollText = rolls.join(', ');
            resultsDiv.innerHTML += `<div>${abilityLabels[ab]}: [${rollText}] = ${total} (mod ${mod >= 0 ? '+' + mod : mod})</div>`;
        });

        const prof = 2;
        const cls = document.getElementById('charClass').value.trim().toLowerCase();
        const hitDie = classHitDice[cls] || 8;
        const ca = 10 + abilityModifiers.dex;
        const pv = hitDie + abilityModifiers.con;
        const spellAbility = document.getElementById('spellAbility').value;
        const spellMod = abilityModifiers[spellAbility];
        const spellAtk = spellMod + prof;
        const spellDc = 8 + prof + spellMod;
        const perceptionProf = document.getElementById('perceptionProficiency').checked ? prof : 0;
        const passivePerc = 10 + abilityModifiers.sag + perceptionProf;

        document.getElementById('profBonus').textContent = `+${prof}`;
        document.getElementById('caValue').textContent = ca;
        document.getElementById('hpValue').textContent = pv;
        document.getElementById('spellAtk').textContent = `${spellAtk >= 0 ? '+' : ''}${spellAtk}`;
        document.getElementById('spellDc').textContent = spellDc;
        document.getElementById('passPerc').textContent = passivePerc;

        const calcDiv = document.getElementById('calcDetails');
        calcDiv.innerHTML = `
            <p>CA = 10 + mod. DEX (${abilityModifiers.dex}) = ${ca}</p>
            <p>PV = d${hitDie} + mod. CON (${abilityModifiers.con}) = ${pv}</p>
            <p>Bonus d'attaque de sort = mod. ${spellAbility.toUpperCase()} (${spellMod}) + maîtrise (${prof}) = ${spellAtk >= 0 ? '+' : ''}${spellAtk}</p>
            <p>DD de sort = 8 + maîtrise (${prof}) + mod. ${spellAbility.toUpperCase()} (${spellMod}) = ${spellDc}</p>
            <p>Perception passive = 10 + mod. SAG (${abilityModifiers.sag})${perceptionProf ? ` + maîtrise (${prof})` : ''} = ${passivePerc}</p>
        `;

        document.getElementById('derivedSection').style.display = 'block';
    }

    function openCharacterCreator() {
        const content = `
            <form id="characterForm">
                <div class="form-group">
                    <label>Nom</label>
                    <input type="text" id="charName" required>
                </div>
                <div class="form-group">
                    <label>Race</label>
                    <input type="text" id="charRace">
                </div>
                <div class="form-group">
                    <label>Classe</label>
                    <input type="text" id="charClass">
                </div>
                <div class="form-group">
                    <label>Caractéristique d'incantation</label>
                    <select id="spellAbility">
                        <option value="int">INT</option>
                        <option value="sag">SAG</option>
                        <option value="cha">CHA</option>
                    </select>
                </div>
                <div class="form-group">
                    <label><input type="checkbox" id="perceptionProficiency"> Perception maîtrisée</label>
                </div>
                <div class="form-group">
                    <button type="button" class="btn btn-info" onclick="rollAbilities()">Lancer les caractéristiques</button>
                </div>
                <div id="abilitiesResults" class="mb-2"></div>
                <div id="derivedSection" style="display:none;">
                    <p>Maîtrise : <span id="profBonus"></span></p>
                    <p>CA : <span id="caValue"></span></p>
                    <p>PV : <span id="hpValue"></span></p>
                    <p>Bonus d'attaque de sort : <span id="spellAtk"></span></p>
                    <p>DD de sort : <span id="spellDc"></span></p>
                    <p>Perception passive : <span id="passPerc"></span></p>
                    <button type="button" class="btn btn-secondary mt-2" id="toggleCalcBtn">Afficher les calculs</button>
                    <div id="calcDetails" style="display:none; margin-top:10px; font-size:0.9em;"></div>
                </div>
                <div class="mt-3 text-center">
                    <button type="submit" class="btn btn-success">Valider</button>
                    <button type="button" class="btn" onclick="closeModal()">Annuler</button>
                </div>
            </form>
        `;

        showModal('Créer un personnage', content);

        document.getElementById('toggleCalcBtn').addEventListener('click', () => {
            const details = document.getElementById('calcDetails');
            details.style.display = details.style.display === 'none' ? 'block' : 'none';
        });

        document.getElementById('characterForm').addEventListener('submit', function(e) {
            e.preventDefault();
            if (Object.keys(abilityScores).length === 0) {
                alert('Veuillez lancer les caractéristiques.');
                return;
            }
            const name = document.getElementById('charName').value.trim();
            const race = document.getElementById('charRace').value.trim();
            const cls = document.getElementById('charClass').value.trim();
            const level = 1;
            const ca = 10 + abilityModifiers.dex;
            const hitDie = classHitDice[cls.toLowerCase()] || 8;
            const pv = hitDie + abilityModifiers.con;
            const id = 'pj_' + Date.now();

            campaignData.characters[id] = {
                id,
                name,
                type: 'pj',
                race,
                class: cls,
                level,
                hp: { current: pv, max: pv },
                stats: {
                    ca,
                    for: abilityScores.for,
                    dex: abilityScores.dex,
                    con: abilityScores.con,
                    int: abilityScores.int,
                    sag: abilityScores.sag,
                    cha: abilityScores.cha
                },
                ideals: '',
                objectives: '',
                actions: [],
                inventory: []
            };

            updateCharactersDisplay();
            saveData();
            closeModal();
        });
    }

    window.openCharacterCreator = openCharacterCreator;
    window.rollAbilities = rollAbilities;
})();
