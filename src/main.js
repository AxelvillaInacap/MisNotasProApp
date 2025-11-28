import './styles.css';
const { invoke } = window.__TAURI__.core;

const layout = document.getElementById('app-layout');
const backBtn = document.getElementById('mobile-back-btn');
const themeBtn = document.getElementById('theme-btn');
const html = document.documentElement;
const noteTitle = document.querySelector('.note-title');
const editor = document.querySelector('.editor');
const notesList = document.getElementById('notes-list');
const foldersList = document.getElementById('folders-list');
const newNoteBtn = document.getElementById('new-note-btn');
const newFolderBtn = document.getElementById('new-folder-btn');
const currentFolderLabel = document.getElementById('current-folder-title');
const folderActions = document.getElementById('folder-actions');
const searchInput = document.getElementById('search-input');
const renameFolderBtn = document.getElementById('rename-folder-btn');
const deleteFolderBtn = document.getElementById('delete-folder-btn');
const wordCountLabel = document.getElementById('word-count');
const charCountLabel = document.getElementById('char-count');

let saveTimeout;
let currentNote = ""; 
let currentFolder = null;

// --- NAVEGACIÓN ---
function navigateToEditor() { if (window.innerWidth <= 768) layout.classList.add('view-editor'); }
function navigateToDashboard() { layout.classList.remove('view-editor'); updateWordCount(); }
if(backBtn) backBtn.onclick = navigateToDashboard;

// --- CARPETAS ---
async function loadFolders() {
    try {
        const folders = await invoke('get_folders');
        foldersList.innerHTML = '';
        const liGen = document.createElement('li'); liGen.textContent = "📁 General";
        if (currentFolder === null) liGen.classList.add('active');
        liGen.onclick = () => selectFolder(null); foldersList.appendChild(liGen);
        folders.forEach(f => {
            const li = document.createElement('li'); li.textContent = `📂 ${f}`;
            if (currentFolder === f) li.classList.add('active');
            li.onclick = () => selectFolder(f); foldersList.appendChild(li);
        });
    } catch(e) { console.error(e); }
}
async function createFolder() {
    const n = prompt("Nombre carpeta:");
    if (n && n.trim()) { try { await invoke('create_folder', { name: n.trim() }); loadFolders(); } catch(e) { alert(e); } }
}
function selectFolder(name) {
    currentFolder = name; currentFolderLabel.textContent = name ? `📂 ${name}` : "MIS NOTAS (General)";
    folderActions.style.display = name ? "flex" : "none";
    loadFolders(); loadNotesList(); searchInput.value = ""; 
}
renameFolderBtn.onclick = async () => {
    if(!currentFolder) return;
    const n = prompt("Renombrar a:", currentFolder);
    if(n && n!==currentFolder) { await invoke('rename_folder', { oldName:currentFolder, newName:n }); selectFolder(n); }
};
deleteFolderBtn.onclick = async () => {
    if(currentFolder && confirm("Borrar?")) { await invoke('delete_folder', { name:currentFolder }); selectFolder(null); }
};

// --- NOTAS ---
async function loadNotesList() {
    try {
        const notes = await invoke('get_notes', { subfolder: currentFolder });
        const pinned = JSON.parse(localStorage.getItem('pinned-notes')||'[]');
        notes.sort((a,b) => {
            const pa = pinned.includes(a), pb = pinned.includes(b);
            if(pa && !pb) return -1; if(!pa && pb) return 1; return a.localeCompare(b);
        });
        notesList.innerHTML = '';
        notes.forEach(n => {
            const li = document.createElement('li'); li.style.display="flex"; li.style.justifyContent="space-between"; li.style.alignItems="center";
            const icon = pinned.includes(n) ? "⭐ " : "📄 ";
            const span = document.createElement('span'); span.textContent = icon+n; span.style.flexGrow="1"; span.style.padding="10px 0";
            span.onclick = () => openNote(n);
            const del = document.createElement('span'); del.textContent="🗑️"; del.style.opacity="0.5"; del.style.padding="10px";
            del.onclick=(e)=>{e.stopPropagation(); deleteNote(n);};
            if(n===currentNote) li.classList.add('active');
            li.appendChild(span); li.appendChild(del); notesList.appendChild(li);
        });
    } catch(e){ console.error(e); }
}
async function saveNote() {
    let t = noteTitle.value.trim(); if(!t) return;
    try {
        if(currentNote && currentNote!==t) {
            await invoke('rename_note', { subfolder:currentFolder, oldTitle:currentNote, newTitle:t });
            let p = JSON.parse(localStorage.getItem('pinned-notes')||'[]');
            let idx = p.indexOf(currentNote); if(idx!==-1) { p[idx]=t; localStorage.setItem('pinned-notes',JSON.stringify(p)); }
            currentNote=t;
        }
        await invoke('save_note', { subfolder:currentFolder, title:t, content:editor.innerHTML.trim() });
        if(!currentNote) currentNote=t; loadNotesList();
    } catch(e){ console.error(e); }
}
function triggerSave() { clearTimeout(saveTimeout); saveTimeout=setTimeout(saveNote,800); updateWordCount(); }
async function openNote(t) { 
    const c = await invoke('load_note_content', { subfolder:currentFolder, title:t });
    noteTitle.value=t; editor.innerHTML=c; currentNote=t; loadNotesList(); updateToolbar(); updateWordCount(); navigateToEditor();
}
function createNewNote() { 
    currentNote=""; noteTitle.value="Nueva Nota"; editor.innerHTML=""; 
    const a = document.querySelector('#notes-list .active'); if(a) a.classList.remove('active'); 
    noteTitle.focus(); updateToolbar(); updateWordCount(); navigateToEditor();
}
async function deleteNote(t) { if(confirm("Borrar?")) { await invoke('delete_note', { subfolder:currentFolder, title:t }); let p=JSON.parse(localStorage.getItem('pinned-notes')||'[]'); localStorage.setItem('pinned-notes',JSON.stringify(p.filter(x=>x!==t))); if(currentNote===t) createNewNote(); loadNotesList(); } }

// --- HERRAMIENTAS ---
function updateWordCount() { const t=editor.innerText||""; wordCountLabel.textContent=`${t.trim().split(/\s+/).filter(w=>w.length).length} palabras`; charCountLabel.textContent=`${t.length} caracteres`; }
document.getElementById('pin-btn').onclick = () => {
    if(!currentNote) return; let p=JSON.parse(localStorage.getItem('pinned-notes')||'[]');
    if(p.includes(currentNote)) p=p.filter(x=>x!==currentNote); else p.push(currentNote);
    localStorage.setItem('pinned-notes',JSON.stringify(p)); loadNotesList(); updateToolbar();
};
window.toggleColor = function(hexColor) {
    editor.focus(); document.execCommand('styleWithCSS', false, true);
    if (hexColor === 'transparent') {
        document.execCommand('hiliteColor', false, 'transparent');
        const isDark = html.getAttribute('data-theme') === 'dark';
        document.execCommand('foreColor', false, isDark ? '#e0e0e0' : '#2c2c2c');
    } else {
        document.execCommand('hiliteColor', false, hexColor);
        document.execCommand('foreColor', false, '#000000');
    }
    updateToolbar(); 
};
window.format=(c,v)=>{editor.focus(); document.execCommand(c,false,v); updateToolbar();};
window.toggleHeading=(t)=>{editor.focus(); const c=document.queryCommandValue('formatBlock'); document.execCommand('formatBlock',false, c.toLowerCase()===t.toLowerCase()?'div':t); updateToolbar();};

// --- FUNCIONES EXTRA (Próximamente) ---
window.exportPDF=()=>{
    if (window.innerWidth <= 768) { alert("🚧 Próximamente: Exportar a PDF en Android"); } 
    else { window.print(); }
};
// --- INSERTAR IMAGEN (Lógica Híbrida) ---
window.insertImage = () => {
    // Si estamos en celular, mantenemos el aviso por ahora
    if (window.innerWidth <= 768) {
        alert("🚧 Próximamente: Podrás agregar fotos desde tu galería en Android.");
        return;
    }

    // SI ES PC: Creamos un input invisible para elegir archivo
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*'; // Solo imágenes
    
    input.onchange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Leemos el archivo y lo convertimos a algo que el navegador entienda (Base64)
        const reader = new FileReader();
        reader.onload = (event) => {
            const imgHtml = `<img src="${event.target.result}" class="img-full" style="max-width: 100%; border-radius: 8px; margin: 10px 0;">`;
            // Insertamos la imagen donde esté el cursor
            editor.focus();
            document.execCommand('insertHTML', false, imgHtml);
            triggerSave(); // Guardamos cambios
        };
        reader.readAsDataURL(file);
    };
    
    input.click(); // Abrimos el selector de archivos
};

// --- LOGICA PARA REDIMENSIONAR IMÁGENES AL CLIC ---
// Agregamos esto para que detecte clics en imágenes dentro del editor
editor.addEventListener('click', (e) => {
    if (e.target.tagName === 'IMG') {
        const img = e.target;
        // Ciclo de tamaños: Full -> Small -> Medium -> Full
        if (img.classList.contains('img-full')) {
            img.className = 'img-small';
        } else if (img.classList.contains('img-small')) {
            img.className = 'img-medium';
        } else {
            img.className = 'img-full';
        }
        triggerSave(); // Guardar el nuevo tamaño
    }
});

function updateToolbar() {
    ['bold','italic','underline','insertUnorderedList'].forEach(c=>{const b=document.querySelector(`.toolbar button[onclick*="${c}"]`); if(b) b.classList.toggle('active',document.queryCommandState(c));});
    const bv=document.queryCommandValue('formatBlock'), h1=document.querySelector('button[title="Título Grande"]'), h2=document.querySelector('button[title="Subtítulo"]');
    if(h1) h1.classList.toggle('active',bv==='h1'); if(h2) h2.classList.toggle('active',bv==='h2');
    const pb=document.getElementById('pin-btn'); if(pb) pb.classList.toggle('active', JSON.parse(localStorage.getItem('pinned-notes')||'[]').includes(currentNote));
}

// --- SETTINGS ---
const sm=document.getElementById('settings-modal'); document.getElementById('settings-btn').onclick=()=>sm.style.display="flex";
document.getElementById('close-settings').onclick=()=>sm.style.display="none"; window.onclick=(e)=>{if(e.target===sm)sm.style.display="none";};
document.getElementById('font-select').onchange=(e)=>{ document.body.classList.remove('font-system','font-serif','font-mono'); document.body.classList.add(`font-${e.target.value}`); localStorage.setItem('preferred-font',e.target.value); };
document.getElementById('font-size-slider').oninput=(e)=>{ editor.style.fontSize=`${e.target.value}px`; document.getElementById('font-size-value').textContent=`${e.target.value}px`; localStorage.setItem('preferred-size',e.target.value); };

// --- INIT ---
function lt(){const t=localStorage.getItem('theme')||'light'; html.setAttribute('data-theme',t); themeBtn.textContent=t==='dark'?'☀️ Modo Claro':'🌙 Modo Oscuro';}
themeBtn.onclick=()=>{const n=html.getAttribute('data-theme')==='dark'?'light':'dark'; html.setAttribute('data-theme',n); localStorage.setItem('theme',n); themeBtn.textContent=n==='dark'?'☀️ Modo Claro':'🌙 Modo Oscuro';};
lt(); loadFolders(); loadNotesList();
const sf=localStorage.getItem('preferred-font')||'system'; document.body.classList.add(`font-${sf}`); document.getElementById('font-select').value=sf;
const ss=localStorage.getItem('preferred-size')||'16'; editor.style.fontSize=`${ss}px`; document.getElementById('font-size-slider').value=ss;
noteTitle.oninput=triggerSave; editor.oninput=triggerSave; newNoteBtn.onclick=createNewNote; newFolderBtn.onclick=createFolder;
document.getElementById('pin-btn').onclick = togglePin; 
editor.onkeyup=updateToolbar; editor.onmouseup=updateToolbar; searchInput.oninput=(e)=>{const t=e.target.value.toLowerCase(); notesList.querySelectorAll('li').forEach(n=>n.style.display=n.textContent.toLowerCase().includes(t)?'flex':'none');};
function togglePin() { if(!currentNote) return; let p=JSON.parse(localStorage.getItem('pinned-notes')||'[]'); if(p.includes(currentNote)) p=p.filter(x=>x!==currentNote); else p.push(currentNote); localStorage.setItem('pinned-notes',JSON.stringify(p)); loadNotesList(); updateToolbar(); }

// --- ANCLA PARA EL TECLADO (NUEVO) ---
// Esto obliga a la app a quedarse quieta cuando sale el teclado
if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', () => {
        // Al cambiar el tamaño (teclado), forzamos scroll arriba
        window.scrollTo(0, 0);
        // Ajustamos la altura del cuerpo al tamaño visible real
        document.body.style.height = window.visualViewport.height + 'px';
    });
}

// Refuerzo extra: al enfocar para escribir, clavar arriba
document.addEventListener('focusin', (e) => {
    if(e.target.tagName === 'INPUT' || e.target.getAttribute('contenteditable')) {
        setTimeout(() => window.scrollTo(0, 0), 50);
    }
});