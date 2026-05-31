function patchAdminForm() {
  const sortInput = document.getElementById('productSort');
  if (sortInput && sortInput.closest('label')) {
    sortInput.closest('label').style.display = 'none';
  }

  const oldEmoji = document.getElementById('productEmoji');
  if (oldEmoji && oldEmoji.tagName !== 'SELECT') {
    const select = document.createElement('select');
    select.id = 'productEmoji';
    select.required = true;
    select.innerHTML = [
      ['🍅','تەماتە'], ['🥒','خەیار'], ['🥬','کاهو'], ['🥔','پەتاتە'],
      ['🧅','پیاز'], ['🫑','بێبەر'], ['🥕','گێزەر'], ['🍋','لیمۆ'],
      ['🍎','سێڤ'], ['🍌','مۆز'], ['🍊','پرتەقاڵ'], ['🍇','تری'],
      ['🍉','شەمامی'], ['🍓','فرێز'], ['🍆','بادمجان'], ['🌽','گەنمەشامی'],
      ['🧄','سیری'], ['🌶️','فلفل']
    ].map(item => `<option value="${item[0]}">${item[0]} ${item[1]}</option>`).join('');
    oldEmoji.replaceWith(select);
  }

  const note = document.querySelector('#clientForm')?.previousElementSibling;
  if (note) {
    note.textContent = 'UID هەمان User ID ـە ل Supabase. بچۆ Authentication → Users، کلیک ل کریاری بکە، User ID کۆپی بکە و ل ڤێرێ دابنێ.';
  }
}

patchAdminForm();
setInterval(patchAdminForm, 1000);
