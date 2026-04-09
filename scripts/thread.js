// 스레드(방명록) Supabase 연동 모듈
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const SUPABASE_URL = 'https://rzmtwwslpgmdxxztvbnh.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ6bXR3d3NscGdtZHh4enR2Ym5oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM0MDI1MDUsImV4cCI6MjA1ODk3ODUwNX0.yaHCxqh1Owg9N-4EHPbh-Yz99K1V_7kZncuuAspsC4Q';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const toggleBtn = document.getElementById('guestbookToggle');
const iconOff   = document.getElementById('guestbookOff');
const iconOn    = document.getElementById('guestbookOn');
const panel     = document.getElementById('guestbook');
const textarea  = panel.querySelector('textarea');
const saveBtn   = panel.querySelector('button');

async function loadMessages() {
    const { data } = await supabase.from('guest_book').select().order('created_at', { ascending: false });
    // TODO: 메시지 목록 렌더링 구현
    console.log('메시지:', data);
}

async function saveMessage() {
    const content = textarea.value.trim();
    if (!content) return;
    await supabase.from('guest_book').insert({ content });
    textarea.value = '';
    await loadMessages();
}

function togglePanel() {
    const active = toggleBtn.classList.toggle('active');
    iconOff.classList.toggle('hidden', active);
    iconOn.classList.toggle('hidden', !active);
    panel.classList.toggle('show', active);
    panel.classList.toggle('hidden', !active);
    if (active) loadMessages();
}

export function init() {
    toggleBtn.addEventListener('click', togglePanel);
    saveBtn.addEventListener('click', saveMessage);
}
