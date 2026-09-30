let countBpReduce = 0;          // 已扣命数
let countBpAdd = 0;             // 已加命数
let countBpOriginal = 0;        // 原始命数（用户输入的剩余命数）
let countBpCurrent = 0;         // 实际剩余命数（计算值）
let isCountBpCD = false;        // 冷却中
let countBpCd = 5;             // 默认冷却时间（秒）

function initPkg_LiveTool_CountBp() {
    LiveTool_CountBp_insertDom();
    LiveTool_CountBp_insertFunc();
    initPkg_CountBp_Set();
}

function LiveTool_CountBp_insertDom() {
    let a = document.createElement("div");
    a.className = "livetool__cell";
    let cell = `
        <div class='livetool__cell_title'>
            <span id='count_bp__title'>自动发送计数弹幕(白胖直播间专属)</span>
        </div>
    `;
    let panel = `
        <div class='count_bp__panel' style='display:none;'>
            <div id="count_bp__status">当前已扣命数：0，已加命数：0，剩余命数：0</div>
            <label>已加命数：<input id="count_bp__add_input" type="text" placeholder="0" /></label>
            <label>剩余命数：<input id="count_bp__original_input" type="text" placeholder="0" /></label>
            <div class="count_bp__buttons">
                <input style="width:60px;margin-left:10px;" type="button" id="count_bp__add_btn" value="计数+1"/>
                <input style="width:70px;margin-left:10px;" type="button" id="count_bp__reset_btn" value="重置计数"/>
                <input style="width:70px;margin-left:10px;" type="button" id="count_bp__summary_btn" value="发送汇总"/>
            </div>
        </div>
    `;
    a.innerHTML = cell + panel;

    let b = document.getElementsByClassName("livetool")[0];
    b.insertBefore(a, b.childNodes[0]);
}

function LiveTool_CountBp_insertFunc() {

    // 标题点击事件
    document.getElementById("count_bp__title").addEventListener("click", () => {
        let panel = document.getElementsByClassName("count_bp__panel")[0];
        panel.style.display = panel.style.display === "block" ? "none" : "block";
    });

    // 已加命数输入框事件
    document.getElementById("count_bp__add_input").addEventListener("change", () => {
        countBpAdd = Number(document.getElementById("count_bp__add_input").value) || 0;
        updateCountBpDisplay();
        saveData_CountBpSettings();
    });

    // 原始命数输入框事件
    document.getElementById("count_bp__original_input").addEventListener("change", () => {
        countBpOriginal = Number(document.getElementById("count_bp__original_input").value) || 0;
        // 当原始命数更新后，重新计算剩余命数
        countBpCurrent = countBpOriginal - countBpReduce;
        updateCountBpDisplay();
        saveData_CountBpSettings();
    });

    // 计数+1按钮事件
    document.getElementById("count_bp__add_btn").addEventListener("click", () => {
        handleCountBpAdd();
    });

    // 重置计数按钮事件
    document.getElementById("count_bp__reset_btn").addEventListener("click", () => {
        handleCountBpReset();
    });

    // 汇总按钮事件
    document.getElementById("count_bp__summary_btn").addEventListener("click", () => {
        sendCountBpSummary();
    });
}

function updateCountBpDisplay() {
    const statusElement = document.getElementById("count_bp__status");
    const calculation = `${countBpOriginal} - ${countBpReduce} = ${countBpCurrent}`;

    // 更新输入框的值
    document.getElementById("count_bp__add_input").value = countBpAdd;
    document.getElementById("count_bp__original_input").value = countBpOriginal;

    if (countBpCurrent <= 0) {
        statusElement.innerHTML = `当前已扣${countBpReduce}命，已加${countBpAdd}命，已团灭！`;
    } else {
        statusElement.innerHTML = `当前已扣${countBpReduce}命，已加${countBpAdd}命，剩余${calculation}命`;
    }
}

function handleCountBpAdd() {
    if (isCountBpCD) return;

    // 扣命数增加，实际剩余命数减少
    countBpReduce++;
    countBpCurrent = countBpOriginal - countBpReduce;

    updateCountBpDisplay();
    saveData_CountBpSettings();

    // 只发送计数变化消息，不包含增加的命数
    let message;
    if (countBpCurrent <= 0) {
        message = `当前已扣${countBpReduce}命，已团灭！`;
    } else {
        message = `当前已扣${countBpReduce}命！`;
    }

    sendBarrage(message);

    // 设置冷却时间
    if (countBpCd > 0) {
        isCountBpCD = true;
        setTimeout(() => {
            isCountBpCD = false;
        }, countBpCd * 1000);
    }
}

function handleCountBpReset() {
    countBpReduce = 0;
    countBpAdd = 0;
    countBpOriginal = 0;
    countBpCurrent = 0;

    updateCountBpDisplay();
    saveData_CountBpSettings();
}

function sendCountBpSummary() {
    const calculation = `${countBpOriginal} - ${countBpReduce} = ${countBpCurrent}`;
    const calculationAdd = `${countBpOriginal} - ${countBpReduce} + ${countBpAdd} = ${countBpCurrent + countBpAdd}`;
    let summaryText;

    if (countBpCurrent <= 0) {
        summaryText = `当前已扣${countBpReduce}命，已加${countBpAdd}命，已团灭！（${calculation}）`;
    } else {
        summaryText = `当前已扣${countBpReduce}命，已加${countBpAdd}命，剩余${calculationAdd}命`;
    }

    sendBarrage(summaryText);
}

function saveData_CountBpSettings() {
    localStorage.setItem("ExSave_CountBpReduce", countBpReduce);
    localStorage.setItem("ExSave_CountBpAdd", countBpAdd);
    localStorage.setItem("ExSave_CountBpOriginal", countBpOriginal);
    localStorage.setItem("ExSave_CountBpCurrent", countBpCurrent);
}

function initPkg_CountBp_Set() {

    // 加载已扣次数
    ret = localStorage.getItem("ExSave_CountBpReduce");
    if (ret !== null) {
        countBpReduce = Number(ret);
    } else {
        countBpReduce = 0;
    }

    // 加载已加命数
    ret = localStorage.getItem("ExSave_CountBpAdd");
    if (ret !== null) {
        countBpAdd = Number(ret);
        document.getElementById("count_bp__add_input").value = ret;
    } else {
        countBpAdd = 0;
    }

    // 加载原始命数
    ret = localStorage.getItem("ExSave_CountBpOriginal");
    if (ret !== null) {
        countBpOriginal = Number(ret);
        document.getElementById("count_bp__original_input").value = ret;
    } else {
        countBpOriginal = 0;
    }

    // 加载当前命数
    ret = localStorage.getItem("ExSave_CountBpCurrent");
    if (ret !== null) {
        countBpCurrent = Number(ret);
    } else {
        countBpCurrent = 0;
    }

    // 更新显示状态
    updateCountBpDisplay();
}

// 初始化时加载功能
if (!window.countBpInitialized) {
    window.countBpInitialized = true;
    setTimeout(initPkg_LiveTool_CountBp, 1000);
}