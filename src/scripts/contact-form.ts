// The form has no backend: it composes a message and hands it to WhatsApp or the mail client.
const form = document.getElementById('contact-form') as HTMLFormElement | null;
if (form) {
  const tpl = form.dataset.template || '';
  const subjectTpl = form.dataset.subject || '';
  const wa = form.dataset.wa || '';
  const email = form.dataset.email || '';
  const val = (n: string) => (form.elements.namedItem(n) as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement | null)?.value?.trim() || '-';
  const interestText = () => { const s = form.elements.namedItem('interest') as HTMLSelectElement | null; return s?.selectedOptions[0]?.text?.trim() || '-'; };
  const compose = () => tpl.replace(/\{(\w+)\}/g, (_, k) => (k === 'interest' ? interestText() : val(k)));
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!form.reportValidity()) return;
    const via = (e.submitter as HTMLButtonElement | null)?.value || 'whatsapp';
    const body = compose();
    if (via === 'email') {
      const subject = subjectTpl.replace(/\{(\w+)\}/g, (_, k) => val(k));
      location.href = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    } else {
      window.open(`https://wa.me/${wa}?text=${encodeURIComponent(body)}`, '_blank', 'noopener');
    }
  });
}
