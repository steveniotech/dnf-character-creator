/* =========================================
   1. OOP 核心：类与封装
========================================= */
class Character {
    #name;
    #classType;
    #level;
    #skin; 

    constructor(name, classType, level, skin) {
        this.#name = name;
        this.#classType = classType;
        this.#level = level;
        this.#skin = skin;
    }

    getName() { return this.#name; }
    getClassType() { return this.#classType; }
    getLevel() { return this.#level; }
    getSkin() { return this.#skin; } 

    levelUp() {
        if (this.#level < 99) this.#level++;
    }

    describe() {
        return `Level ${this.#level} ${this.#classType}.`;
    }

    toJSON() {
        return { 
            name: this.#name, 
            classType: this.#classType, 
            level: this.#level,
            skin: this.#skin 
        };
    }
}

/* =========================================
   2. OOP 核心：继承与多态
========================================= */
class Warrior extends Character {
    #weapon;

    constructor(name, level, weapon, skin) {
        super(name, "Warrior", level, skin); 
        this.#weapon = weapon;
    }

    describe() {
        return `⚔️ Lvl ${this.getLevel()} Warrior wielding a ${this.#weapon}.`;
    }

    performAction() {
        alert(`${this.getName()} attacks fiercely with the ${this.#weapon}!`);
    }

    toJSON() {
        const data = super.toJSON();
        data.specialTrait = this.#weapon;
        return data;
    }
}

class Mage extends Character {
    #spell;

    constructor(name, level, spell, skin) {
        super(name, "Mage", level, skin);
        this.#spell = spell;
    }

    #castSpellAnimation() {
        console.log(`[Animation Log] ${this.getName()}'s hands glow...`);
    }

    describe() {
        return `🔮 Lvl ${this.getLevel()} Mage who knows ${this.#spell}.`;
    }

    performAction() {
        this.#castSpellAnimation();
        alert(`${this.getName()} casts ${this.#spell}! ✨`);
    }

    toJSON() {
        const data = super.toJSON();
        data.specialTrait = this.#spell;
        return data;
    }
}

/* =========================================
   3. 工厂模式
========================================= */
class CharacterFactory {
    static create(data) {
        if (data.classType === "Warrior") {
            return new Warrior(data.name, data.level, data.specialTrait, data.skin);
        } else if (data.classType === "Mage") {
            return new Mage(data.name, data.level, data.specialTrait, data.skin);
        }
        return null;
    }
}

/* =========================================
   4. DOM 操作与表单逻辑
========================================= */
const form = document.getElementById('character-form');
const classSelect = document.getElementById('char-class');
const weaponGroup = document.getElementById('weapon-group');
const spellGroup = document.getElementById('spell-group');
const errorBox = document.getElementById('errorBox');
const characterListDiv = document.getElementById('character-list');

let myParty = []; 

classSelect.addEventListener('change', (e) => {
    if (e.target.value === "Warrior") {
        weaponGroup.style.display = "block";
        spellGroup.style.display = "none";
    } else {
        weaponGroup.style.display = "none";
        spellGroup.style.display = "block";
    }
});

function showError(message) {
    errorBox.textContent = message;
    errorBox.style.display = "block";
}

function clearError() {
    errorBox.style.display = "none";
}

form.addEventListener('submit', (e) => {
    e.preventDefault(); 
    clearError();

    const name = document.getElementById('char-name').value.trim();
    const level = parseInt(document.getElementById('char-level').value);
    const classType = classSelect.value;
    const selectedSkin = document.querySelector('input[name="char-skin"]:checked').value;

    if (name.length < 3) {
        showError("Error: Name must be at least 3 characters.");
        return;
    }
    if (!Number.isInteger(level) || level < 1 || level > 99) {
        showError("Error: Level must be between 1 and 99.");
        return;
    }

    let specialTrait = "";
    if (classType === "Warrior") {
        specialTrait = document.getElementById('char-weapon').value.trim() || "Sword";
    } else {
        specialTrait = document.getElementById('char-spell').value.trim() || "Fireball";
    }

    const newHero = CharacterFactory.create({ name, classType, level, specialTrait, skin: selectedSkin });
    myParty.push(newHero);
    
    saveGame();
    renderParty();
    form.reset(); 
    classSelect.dispatchEvent(new Event('change')); 
});

/* =========================================
   5. 数据持久化与渲染（包含真实图片展示）
========================================= */
function saveGame() {
    const dataToSave = myParty.map(char => char.toJSON());
    localStorage.setItem("myPartyData", JSON.stringify(dataToSave));
}

function loadGame() {
    const savedData = localStorage.getItem("myPartyData");
    if (savedData) {
        const parsedData = JSON.parse(savedData);
        myParty = parsedData.map(data => CharacterFactory.create(data));
        renderParty();
    }
}

function renderParty() {
    characterListDiv.innerHTML = ""; 
    
    myParty.forEach((char) => {
        const card = document.createElement('div');
        card.className = "character-card";
        
        // 创建人物立绘图片
        const imageContainer = document.createElement('div');
        imageContainer.className = "image-container";
        
        const portrait = document.createElement('img');
        portrait.className = "character-portrait";
        
        // 分配职业立绘 (你可以随时在这里换成你自己的图片链接)
        if (char.getClassType() === "Warrior") {
            portrait.src = "https://img.icons8.com/color/150/000000/knight.png"; 
        } else if (char.getClassType() === "Mage") {
            portrait.src = "https://img.icons8.com/color/150/000000/witch.png"; 
        }
        imageContainer.appendChild(portrait);

        // 渲染名字旁的 emoji 皮肤标识
        let avatarIcon = "🧑";
        if (char.getSkin() === "cyber") avatarIcon = "🤖";
        if (char.getSkin() === "undead") avatarIcon = "💀";

        const header = document.createElement('h3');
        header.textContent = `${avatarIcon} ${char.getName()}`;
        
        const description = document.createElement('p');
        description.textContent = char.describe();
        
        const actionDiv = document.createElement('div');
        actionDiv.className = "card-actions";
        
        const performBtn = document.createElement('button');
        performBtn.className = "action-btn";
        performBtn.textContent = "Perform Action";
        performBtn.onclick = () => char.performAction(); 

        const levelUpBtn = document.createElement('button');
        levelUpBtn.className = "action-btn level-up";
        levelUpBtn.textContent = "Level Up";
        levelUpBtn.onclick = () => {
            char.levelUp();
            saveGame();
            renderParty();
        };

        actionDiv.appendChild(performBtn);
        actionDiv.appendChild(levelUpBtn);
        
        // 按顺序组装：图片 -> 标题 -> 描述 -> 按钮
        card.appendChild(imageContainer);
        card.appendChild(header); 
        card.appendChild(description);
        card.appendChild(actionDiv);
        characterListDiv.appendChild(card);
    });
}

loadGame();