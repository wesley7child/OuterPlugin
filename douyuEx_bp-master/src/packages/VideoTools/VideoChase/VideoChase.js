function initPkg_VideoTools_FrameChase() {
    initPkg_VideoTools_FrameChase_Dom();
    initPkg_VideoTools_FrameChase_Func();
}

function initPkg_VideoTools_FrameChase_Dom() {
    FrameChase_insertIcon();
}

function FrameChase_insertIcon() {
    const container = document.createElement('div');
    container.id = 'ex-framechase-container';
    container.style.cssText = `
        display: flex;
        align-items: center;
        gap: 4px;
    `;

    // 创建阈值输入框
    const input = document.createElement('input');
    input.type = 'number';
    input.step = '0.1';
    input.min = '0.1';
    input.value = '1';
    input.style.cssText = `
        width: 50px;
        height: 24px;
        padding: 2px 6px;
        border: none;
        border-radius: 3px;
        background: rgba(255, 255, 255, 0.1);
        color: #fff;
        font-size: 12px;
        outline: none;
    `;
    input.addEventListener('change', () => {
        const val = parseFloat(input.value);
        threshold = isNaN(val) || val <= 0 ? 1 : val;
        input.value = threshold.toFixed(1);
    });

    // 创建追帧按钮
    const chaseBtn = document.createElement('div');
    chaseBtn.className = 'xg-icon';
    chaseBtn.innerHTML = `
        <div class="xgplayer-icon" style="
            cursor: pointer;
            color: #fff;
            padding: 4px 8px;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 3px;
            font-size: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            min-width: 32px;
            height: 24px;
            transition: all 0.2s;
        ">
            追
        </div>
    `;

    // 创建状态指示器
    const statusIndicator = document.createElement('div');
    statusIndicator.className = 'status-indicator';
    statusIndicator.style.cssText = `
        color: #fff;
        margin-right: 8px;
        font-size: 12px;
        min-width: 40px;
        text-align: center;
    `;

    // 将所有元素添加到容器
    container.appendChild(input);
    container.appendChild(chaseBtn);
    container.appendChild(statusIndicator);

    // 插入到指定位置
    const target = document.getElementsByClassName('left-d3671e')[0] || document.getElementsByClassName('left-bfab3b')[0];
    if (target && target.childNodes[4]) {
        target.insertBefore(container, target.childNodes[4]);
    } else {
        target.appendChild(container);
    }
}

function initPkg_VideoTools_FrameChase_Func() {
    const chaseBtn = document.querySelector('#ex-framechase-container .xg-icon');
    if (chaseBtn) {
        chaseBtn.addEventListener('click', toggleFrameChase);
    }
}

let isChasing = false;
let chaseInterval = null;
const FAST_SPEED = 2;
const NORMAL_SPEED = 1;
let threshold = 1;

function toggleFrameChase() {
    isChasing = !isChasing;
    if (isChasing) {
        startFrameChase();
    } else {
        stopFrameChase();
    }
}

function startFrameChase() {
    const statusIndicator = document.querySelector('#ex-framechase-container .status-indicator');
    const chaseBtn = document.querySelector('#ex-framechase-container .xg-icon');
    let lastUpdate = 0;

    //调整按钮背景颜色
    chaseBtn.querySelector('.xgplayer-icon').style.background = 'rgba(0,255,0,0.2)';
    chaseBtn.querySelector('.xgplayer-icon').style.boxShadow = '0 0 6px rgba(0,255,0,0.3)';
    chaseInterval = setInterval(() => {
        const buffered = liveVideoNode.buffered;
        if (buffered.length === 0) return;

        const latestTime = buffered.end(buffered.length - 1);
        const currentTime = liveVideoNode.currentTime;
        const diff = latestTime - currentTime;

        // 更新状态显示
        const now = Date.now();
        if (now - lastUpdate > 500) {
            statusIndicator.textContent = `${diff.toFixed(1)}s`;
            lastUpdate = now;
        }

        // 动态调整播放速度
        if (diff > threshold) {
            liveVideoNode.playbackRate = FAST_SPEED;
        } else {
            liveVideoNode.playbackRate = NORMAL_SPEED;
        }
    }, 200);
}

function stopFrameChase() {
    clearInterval(chaseInterval);
    const statusIndicator = document.querySelector('#ex-framechase-container .status-indicator');
    const chaseBtn = document.querySelector('#ex-framechase-container .xg-icon');
    liveVideoNode.playbackRate = NORMAL_SPEED;
    if (statusIndicator) {
        statusIndicator.textContent = '';
    }
    chaseBtn.querySelector('.xgplayer-icon').style.background = 'rgba(255,255,255,0.1)';
    chaseBtn.querySelector('.xgplayer-icon').style.boxShadow = 'none';
}