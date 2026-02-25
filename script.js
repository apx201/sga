/************************************
 * 1. 主题切换（localStorage > 系统）
 ************************************/
const toggleButton = document.getElementById('theme-toggle');

const getPreferredTheme = () => {
  const saved = localStorage.getItem('theme');
  if (saved) return saved;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

const applyTheme = (theme, animate = true) => {
  if (animate) {
    document.body.style.transition = 'background-color .3s,color .3s';
    setTimeout(() => document.body.style.transition = '', 300);
  }
  document.body.classList.toggle('dark', theme === 'dark');
};

/* 初始化：无动画，防止闪烁 */
applyTheme(getPreferredTheme(), false);

/* 手动切换 */
toggleButton?.addEventListener('click', () => {
  const isDark = document.body.classList.contains('dark');
  const newTheme = isDark ? 'light' : 'dark';
  applyTheme(newTheme, true);
  localStorage.setItem('theme', newTheme);
});

/* 系统主题变化（用户没手动设置才跟随） */
window.matchMedia('(prefers-color-scheme: dark)')
      .addEventListener('change', e => {
        if (!localStorage.getItem('theme')) {
          applyTheme(e.matches ? 'dark' : 'light', true);
        }
      });

/************************************
 * 2. 通用淡入动画
 ************************************/
const fadeIO = new IntersectionObserver((entries, observer) => {
  entries.forEach(({ target, isIntersecting }) => {
    if (isIntersecting) {
      target.classList.add('fade');
      observer.unobserve(target);
    }
  });
}, { threshold: 0.2 });

document.querySelectorAll('h1,h2,h3,p,img,section,div,li')
        .forEach(el => fadeIO.observe(el));

/************************************
 * 3. SGA字符转换功能
 ************************************/

// 标准银河字母映射表（基于Minecraft/Commander Keen的SGA）
const charMap = {
    'A': 'ᔑ', 'a': 'ᔑ',
    'B': 'ʖ', 'b': 'ʖ',
    'C': 'ᓵ', 'c': 'ᓵ',
    'D': '↸', 'd': '↸',
    'E': 'ᒷ', 'e': 'ᒷ',
    'F': '⎓', 'f': '⎓',
    'G': '┤', 'g': '┤',
    'H': '⍑', 'h': '⍑',
    'I': '¦', 'i': '¦',
    'J': '⁝', 'j': '⁝',
    'K': 'ꖌ', 'k': 'ꖌ',
    'L': 'ꖎ', 'l': 'ꖎ',
    'M': 'ᒲ', 'm': 'ᒲ',
    'N': 'リ', 'n': 'リ',
    'O': 'ヮ', 'o': 'ヮ',
    'P': 'і!', 'p': 'і!',
    'Q': 'ᑑ', 'q': 'ᑑ',
    'R': '∷', 'r': '∷',
    'S': '𠃑', 's': '𠃑',
    'T': 'ᒣ̣', 't': 'ᒣ̣',
    'U': '⚍', 'u': '⚍',
    'V': '⍊', 'v': '⍊',
    'W': '∴', 'w': '∴',
    'X': '⸱/', 'x': '⸱/',
    'Y': '‖', 'y': '‖',
    'Z': '⨅', 'z': '⨅'
};

// 创建反向映射表
const reverseMap = {};
for (let key in charMap) {
    if (!reverseMap[charMap[key]]) {
        reverseMap[charMap[key]] = key.toUpperCase();
    }
}

// 获取元素
const inputEl = document.getElementById('inputText');
const outputEl = document.getElementById('outputText');

// 统一转换函数
function transform(text, toSGA = true) {
    let result = '';
    
    if (toSGA) {
        // 转为SGA字符
        for (let char of text) {
            result += charMap[char] || char;
        }
    } else {
        // 转回英文（处理多字符映射如 X→̇/）
        let i = 0;
        while (i < text.length) {
            let matched = false;
            // 优先匹配2个字符的特殊符号（如 ̇/、||）
            for (let len = 2; len >= 1; len--) {
                const substr = text.substr(i, len);
                if (reverseMap[substr]) {
                    result += reverseMap[substr];
                    i += len;
                    matched = true;
                    break;
                }
            }
            if (!matched) {
                result += text[i];
                i++;
            }
        }
    }
    
    return result;
}

// 检测文本是否包含SGA字符
function containsSGA(text) {
    const sgaChars = Object.values(charMap);
    return sgaChars.some(char => text.includes(char));
}

// 正向转换（英文→SGA）
function convert() {
    const text = inputEl.value;
    outputEl.value = transform(text, true);
}

// 反向转换（SGA→英文）
function reverseConvert() {
    const text = inputEl.value;
    outputEl.value = transform(text, false);
}

// 清空
function clearAll() {
    inputEl.value = '';
    outputEl.value = '';
    inputEl.focus();
}

// 实时自动转换（智能检测）
inputEl.addEventListener('input', function() {
    const text = this.value;
    if (!text) {
        outputEl.value = '';
        return;
    }
    
    // 检测是否包含SGA字符，自动决定转换方向
    const hasSGA = containsSGA(text);
    outputEl.value = transform(text, !hasSGA);
});

// 支持 Ctrl+Enter 快速转换（当前模式）
inputEl.addEventListener('keydown', function(e) {
    if (e.ctrlKey && e.key === 'Enter') {
        const hasSGA = containsSGA(this.value);
        if (hasSGA) {
            reverseConvert();
        } else {
            convert();
        }
    }
});

// 防止输出框被编辑但允许复制
outputEl.addEventListener('keydown', function(e) {
    if (!(e.ctrlKey && (e.key === 'c' || e.key === 'a'))) {
        e.preventDefault();
    }
});
