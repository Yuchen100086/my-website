/* ============================================================
   Yuchen 的个人主页 · 全站交互脚本
   包含：樱花花瓣、打字机副标题、能力条动画、回到顶部、页脚年份
   所有效果都只是“装饰”——关掉 JS，页面依然完整可读。
   ============================================================ */
(function () {
    'use strict';

    /* 系统开启了“减少动态效果”时，跳过所有动画 */
    var reduceMotion = window.matchMedia &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* ---------- 背景音乐（右下角云朵）----------
       把音频文件放到 audio/ 目录，文件名保持一致即可播放。
       也可以直接把这里换成网络链接，例如 'https://example.com/xxx.mp3'。
    ------------------------------------------- */
    var BGM_SRC = 'audio/haoxiang-wan-yuanshen.mp3';

    /* ---------- 1. 飘落的樱花花瓣 ---------- */
    function makePetals() {
        var layer = document.querySelector('.sakura-layer');
        if (!layer || reduceMotion) {
            return;
        }

        // 手机上少放几片，省电也省性能
        var count = window.innerWidth < 640 ? 8 : 16;
        var frag = document.createDocumentFragment();

        for (var i = 0; i < count; i++) {
            var petal = document.createElement('span');
            petal.className = 'petal';

            var size = 8 + Math.random() * 10;
            petal.style.left = (Math.random() * 100) + 'vw';
            petal.style.width = size + 'px';
            petal.style.height = size + 'px';
            petal.style.animationDuration = (7 + Math.random() * 8).toFixed(1) + 's';
            petal.style.animationDelay = '-' + (Math.random() * 14).toFixed(1) + 's';
            // 每片花瓣飘落时的横向偏移量，避免整齐划一
            petal.style.setProperty('--drift', (Math.random() * 220 - 60).toFixed(0) + 'px');

            frag.appendChild(petal);
        }

        layer.appendChild(frag);
    }

    /* ---------- 2. 首页打字机副标题 ---------- */
    function typeWriter() {
        var el = document.querySelector('[data-typed]');
        if (!el) {
            return;
        }

        var text = el.getAttribute('data-typed') || '';

        if (reduceMotion) {
            el.textContent = text;
            el.classList.add('done');
            return;
        }

        el.textContent = '';
        var i = 0;

        (function tick() {
            el.textContent = text.slice(0, ++i);
            if (i < text.length) {
                setTimeout(tick, 85);
            } else {
                el.classList.add('done');
            }
        })();
    }

    /* ---------- 3. 能力条滚进视野后填充 ---------- */
    function animateBars() {
        var bars = document.querySelectorAll('.bar');
        if (!bars.length) {
            return;
        }

        function fill(el) {
            el.classList.add('in');
        }

        if (!('IntersectionObserver' in window)) {
            Array.prototype.forEach.call(bars, fill);
            return;
        }

        var io = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    fill(entry.target);
                    io.unobserve(entry.target);
                }
            });
        }, { threshold: 0.3 });

        Array.prototype.forEach.call(bars, function (bar) {
            io.observe(bar);
        });
    }

    /* ---------- 4. 回到顶部按钮 ---------- */
    function backToTop() {
        var btn = document.querySelector('.to-top');
        if (!btn) {
            return;
        }

        window.addEventListener('scroll', function () {
            btn.classList.toggle('show', window.scrollY > 320);
        }, { passive: true });

        btn.addEventListener('click', function () {
            window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
        });
    }

    /* ---------- 5. 页脚年份自动更新 ---------- */
    function updateYear() {
        var el = document.getElementById('year');
        if (el) {
            el.textContent = String(new Date().getFullYear());
        }
    }

    /* ---------- 6. 右下角云朵：点击在站内播放背景音乐 ---------- */
    function cloudPlayer() {
        var CLOUD_SVG =
            '<svg viewBox="0 0 100 72" aria-hidden="true">' +
                // 第一层：带描边的云（描边会被第二层盖住，只留外轮廓）
                '<g fill="#ffffff" stroke="#c9b8f5" stroke-width="4" stroke-linejoin="round">' +
                    '<circle cx="30" cy="42" r="17"/>' +
                    '<circle cx="52" cy="32" r="21"/>' +
                    '<circle cx="72" cy="44" r="15"/>' +
                    '<rect x="14" y="41" width="72" height="18" rx="9"/>' +
                '</g>' +
                // 第二层：纯白填充，盖掉内部的描边线
                '<g fill="#ffffff">' +
                    '<circle cx="30" cy="42" r="17"/>' +
                    '<circle cx="52" cy="32" r="21"/>' +
                    '<circle cx="72" cy="44" r="15"/>' +
                    '<rect x="14" y="41" width="72" height="18" rx="9"/>' +
                '</g>' +
                // 云朵的小表情
                '<g>' +
                    '<circle cx="45" cy="46" r="2.4" fill="#5a4a80"/>' +
                    '<circle cx="59" cy="46" r="2.4" fill="#5a4a80"/>' +
                    '<path d="M48 52 q4 4 8 0" stroke="#5a4a80" stroke-width="2" fill="none" stroke-linecap="round"/>' +
                    '<ellipse cx="39" cy="51" rx="3.4" ry="2" fill="#ffb7c5" opacity="0.75"/>' +
                    '<ellipse cx="65" cy="51" rx="3.4" ry="2" fill="#ffb7c5" opacity="0.75"/>' +
                '</g>' +
            '</svg>';

        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'cloud-btn';
        btn.setAttribute('aria-label', '播放或暂停背景音乐：好想玩原神');
        btn.setAttribute('aria-pressed', 'false');
        btn.title = '点击播放：好想玩原神';
        btn.innerHTML = CLOUD_SVG +
            '<span class="cloud-note" aria-hidden="true">♪</span>' +
            '<span class="cloud-note n2" aria-hidden="true">♫</span>' +
            '<span class="cloud-hint">♪ 好想玩原神</span>';

        // 气泡提示
        var toast = document.createElement('div');
        toast.className = 'toast';
        toast.setAttribute('role', 'status');
        var toastTimer = null;

        function showToast(html) {
            toast.innerHTML = html;
            toast.classList.add('show');
            clearTimeout(toastTimer);
            toastTimer = setTimeout(function () {
                toast.classList.remove('show');
            }, 5000);
        }

        // 把 <audio> 放进页面（隐藏）。
        // 用 preload='auto' 让浏览器一打开页面就悄悄开始缓冲，
        // 这样等用户点云朵时通常已经缓冲好了——用 preload='none' 的话，
        // 点了才开始下载，网速慢的时候会长时间没有声音，像是坏了。
        var audio = document.createElement('audio');
        audio.src = BGM_SRC;
        audio.loop = true;
        audio.preload = 'auto';
        audio.volume = 0.85;
        audio.setAttribute('aria-hidden', 'true');
        audio.style.display = 'none';

        var hintEl = btn.querySelector('.cloud-hint');
        var HINT_IDLE = '♪ 好想玩原神';
        var HINT_LOAD = '⏳ 缓冲中…';
        var userAsked = false;

        function setPlaying(on) {
            btn.classList.toggle('playing', on);
            btn.setAttribute('aria-pressed', on ? 'true' : 'false');
        }

        // 还在等数据时给出明确反馈，否则点下去没动静很像坏掉了
        function setLoading(on) {
            btn.classList.toggle('loading', on);
            hintEl.textContent = on ? HINT_LOAD : HINT_IDLE;
        }

        function fail(msg) {
            setPlaying(false);
            setLoading(false);
            showToast(msg);
        }

        var MISSING_MSG = '🌸 音频没能加载～<br>确认 <code>audio/haoxiang-wan-yuanshen.mp3</code> ' +
            '存在且文件名一致，然后刷新页面。';

        btn.addEventListener('click', function () {
            userAsked = true;

            // 正在播放 → 暂停
            if (!audio.paused) {
                audio.pause();
                return;
            }

            if (audio.error) {
                fail(MISSING_MSG);
                return;
            }

            // 数据还不够就先显示“缓冲中…”
            if (audio.readyState < 3) {
                setLoading(true);
            }

            var p = audio.play();
            if (p && typeof p.then === 'function') {
                p.catch(function (err) {
                    fail('🔇 浏览器拦住了播放（' + err.name + '）<br>先点一下页面空白处，再点云朵试试。');
                });
            }
        });

        // 以真实的媒体事件为准，而不是假设点了就能放
        audio.addEventListener('playing', function () { setLoading(false); setPlaying(true); });
        audio.addEventListener('waiting', function () { setLoading(true); });
        audio.addEventListener('stalled', function () { setLoading(true); });
        audio.addEventListener('pause', function () { setLoading(false); setPlaying(false); });
        audio.addEventListener('ended', function () { setPlaying(false); });
        audio.addEventListener('error', function () {
            setPlaying(false);
            setLoading(false);
            // 页面加载时 preload 失败不算用户操作，不要主动弹提示
            if (userAsked) {
                showToast(MISSING_MSG);
            }
        });

        document.body.appendChild(btn);
        document.body.appendChild(audio);
        document.body.appendChild(toast);

        // 刚打开页面时，让“♪ 好想玩原神”的提示自动出现几秒，
        // 不然第一次来的人不知道这里可以点。
        setTimeout(function () { btn.classList.add('hint-on'); }, 1200);
        setTimeout(function () { btn.classList.remove('hint-on'); }, 6800);
    }

    document.addEventListener('DOMContentLoaded', function () {
        makePetals();
        typeWriter();
        animateBars();
        backToTop();
        updateYear();
        cloudPlayer();
    });
})();
