let isRedPacketOn = false;
let redPacketDelay = 0; // 回复延迟时间（秒）
let isRedPacketCD = false;
let redPacketCd = 0; // 冷却时间（秒）
let isWaitingReply = false; // 是否正在等待发送回复

function initPkg_LiveTool_RedPacket_Bp() {
    LiveTool_RedPacket_insertDom();
    LiveTool_RedPacket_insertFunc();
    initPkg_RedPacket_Set();
}

function LiveTool_RedPacket_insertDom() {
    let a = document.createElement("div");
    a.className = "livetool__cell";
    let cell = `
        <div class='livetool__cell_title'>
            <span id='redpacket__title'>自动抢红包(白胖直播间专属)</span>
        </div>
        <div class='livetool__cell_option'>
            <div class="onoffswitch livetool__cell_switch">
                <input type="checkbox" name="onoffswitch" class="onoffswitch-checkbox" id="redpacket__switch" tabindex="0">
                <label class="onoffswitch-label" for="redpacket__switch"></label>
            </div>
        </div>
    `;
    let panel = `
        <div class='redpacket__panel' style='display:none;'>
            <label>回复延迟：<input id="redpacket__delay" type="text" placeholder="秒" /></label>
            <label>冷却时间：<input id="redpacket__cd" type="text" placeholder="秒" /></label>
        </div>
    `;
    a.innerHTML = cell + panel;

    let b = document.getElementsByClassName("livetool")[0];
    b.insertBefore(a, b.childNodes[0]);
}

function LiveTool_RedPacket_insertFunc() {
    // 开关点击事件
    document.getElementById("redpacket__switch").addEventListener("click", () => {
        isRedPacketOn = document.getElementById("redpacket__switch").checked;
        saveData_isRedPacket(); // 只保存开关状态
    });

    // 标题点击事件（展开/收起面板）
    document.getElementById("redpacket__title").addEventListener("click", () => {
        let panel = document.getElementsByClassName("redpacket__panel")[0];
        panel.style.display = panel.style.display === "block" ? "none" : "block";
    });

    // 延迟输入框 change 事件
    document.getElementById("redpacket__delay").addEventListener("change", () => {
        redPacketDelay = Number(document.getElementById("redpacket__delay").value) || 0;
        saveData_RedPacketSettings(); // 实时保存
    });

    // 冷却时间输入框 change 事件
    document.getElementById("redpacket__cd").addEventListener("change", () => {
        redPacketCd = Number(document.getElementById("redpacket__cd").value) || 0;
        saveData_RedPacketSettings(); // 实时保存
    });
}

function saveData_RedPacketSettings() {
    localStorage.setItem("ExSave_RedPacketDelay", redPacketDelay);
    localStorage.setItem("ExSave_RedPacketCd", redPacketCd);
}

function saveData_isRedPacket() {
    let ridArr = [];
    let ret = localStorage.getItem("ExSave_isRedPacket");
    if (ret) {
        let retJson = JSON.parse(ret);
        if ("rooms" in retJson) {
            ridArr = retJson.rooms;
        }
    }
    let index = ridArr.indexOf(rid);
    if (isRedPacketOn) {
        if (index === -1) ridArr.push(rid);
    } else {
        if (index !== -1) ridArr.splice(index, 1);
    }
    let data = { rooms: ridArr };
    localStorage.setItem("ExSave_isRedPacket", JSON.stringify(data));
}

function initPkg_RedPacket_Set() {
    let ret = localStorage.getItem("ExSave_isRedPacket");
    if (ret) {
        let retJson = JSON.parse(ret);
        let ridArr = retJson.rooms || [];
        isRedPacketOn = ridArr.includes(rid);
        document.getElementById("redpacket__switch").checked = isRedPacketOn;
    } else {
        isRedPacketOn = false;
        document.getElementById("redpacket__switch").checked = false;
    }

    ret = localStorage.getItem("ExSave_RedPacketDelay");
    if (ret) {
        redPacketDelay = Number(ret);
        document.getElementById("redpacket__delay").value = ret;
    } else {
        redPacketDelay = 0;
    }

    ret = localStorage.getItem("ExSave_RedPacketCd");
    if (ret) {
        redPacketCd = Number(ret);
        document.getElementById("redpacket__cd").value = ret;
    } else {
        redPacketCd = 0;
    }
}

function initPkg_LiveTool_RedPacket_Bp_Handle(text) {
    if (!isRedPacketOn || isRedPacketCD || isWaitingReply) return;

    if (getType(text) === "chatmsg") {
        let uid = getStrMiddle(text, "uid@=", "/");
        if (uid === my_uid) return;

        let txt = getStrMiddle(text, "txt@=", "/");
        if (txt.startsWith("#红包")) {
            let parts = txt.trim().split(/\s+/);
            let password = parts.length > 1 ? parts[1] : "老板大气";
            let reply = "#抢 " + password;

            if (redPacketDelay > 0) {
                isWaitingReply = true;
                setTimeout(() => {
                    sendBarrage(reply);
                    isWaitingReply = false;
                    if (redPacketCd > 0) {
                        isRedPacketCD = true;
                        setTimeout(() => {
                            isRedPacketCD = false;
                        }, redPacketCd * 1000);
                    }
                }, redPacketDelay * 1000);
            } else {
                sendBarrage(reply);
                if (redPacketCd > 0) {
                    isRedPacketCD = true;
                    setTimeout(() => {
                        isRedPacketCD = false;
                    }, redPacketCd * 1000);
                }
            }
        }
    }
}
