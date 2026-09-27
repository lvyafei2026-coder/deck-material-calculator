function t() { return (window.__i18n && window.__i18n.t) || {}; }

function fmtN(n) {
  if (!isFinite(n)) return '—';
  return Math.ceil(n).toLocaleString('en-US');
}

function fmtUsd(n) {
  if (!isFinite(n)) return '—';
  return '$' + Math.round(n).toLocaleString('en-US');
}

function fmtFt(n) {
  if (!isFinite(n)) return '—';
  return Math.round(n).toLocaleString('en-US') + ' ft';
}

function readUrlParams() {
  const params = new URLSearchParams(window.location.search);
  ['deckLength','deckWidth'].forEach(id => {
    if (params.has(id)) {
      const el = document.getElementById(id);
      if (el) el.value = params.get(id);
    }
  });
  if (params.has('deckLength') || params.has('deckWidth')) calculate();
}

function buildShareUrl() {
  const params = new URLSearchParams();
  params.set('deckLength', document.getElementById('deckLength').value);
  params.set('deckWidth', document.getElementById('deckWidth').value);
  const base = window.location.origin + window.location.pathname;
  return base + '?' + params.toString();
}

function copyShareLink() {
  const url = buildShareUrl();
  navigator.clipboard.writeText(url).then(() => {
    const el = document.getElementById('shareCopied');
    el.classList.add('show');
    setTimeout(() => el.classList.remove('show'), 1800);
  }).catch(() => { prompt('Copy this link:', url); });
}

function calculate() {
  const tr = t();
  const length = parseFloat(document.getElementById('deckLength').value) || 0;
  const width = parseFloat(document.getElementById('deckWidth').value) || 0;
  const boardFace = parseFloat(document.getElementById('boardType').value.replace('_2x6','')) || 5.5;
  const boardLen = parseFloat(document.getElementById('boardLength').value) || 16;
  const gap = parseFloat(document.getElementById('gap').value) || 0.125;
  const joistSpacing = parseFloat(document.getElementById('joistSpacing').value) || 16;
  const boardPrice = parseFloat(document.getElementById('boardPrice').value) || 0;
  const joistPrice = parseFloat(document.getElementById('joistPrice').value) || 0;
  const screwPrice = parseFloat(document.getElementById('screwPrice').value) || 0;

  if (length <= 0 || width <= 0) {
    document.getElementById('result').classList.remove('show');
    return;
  }

  const deckArea = length * width;

  // Boards run perpendicular to house - length direction
  // Each board covers its face width + gap
  const boardFaceFt = (boardFace + gap) / 12;
  const numBoardsRows = Math.ceil(width / boardFaceFt);
  const boardsPerRow = Math.ceil(length / boardLen);
  const totalBoards = numBoardsRows * boardsPerRow;
  const totalBoardLF = totalBoards * boardLen;

  // Joists run along the length direction, spaced by joistSpacing
  const joistSpacingFt = joistSpacing / 12;
  const numJoists = Math.ceil(width / joistSpacingFt) + 1;
  const joistLFPerJoist = length;
  const totalJoistLF = numJoists * joistLFPerJoist;

  // Screws: 2 per joist per board row
  const screwsPerBoard = numJoists * 2;
  const totalScrewsRaw = totalBoards * screwsPerBoard;
  const totalScrews = Math.ceil(totalScrewsRaw * 1.1); // 10% buffer

  // Costs
  const boardCost = totalBoards * boardPrice;
  const joistCost = numJoists * joistPrice * Math.ceil(length / 16); // assume joists bought at 16 ft
  const screwCost = (totalScrews / 100) * screwPrice;
  const totalCost = boardCost + joistCost + screwCost;

  document.getElementById('resultMain').textContent = fmtN(totalBoards) + ' ' + (tr.boards || 'boards');
  document.getElementById('resultSub').textContent = fmtN(deckArea) + ' sq ft · ' + fmtN(numJoists) + ' ' + (tr.joists || 'joists');

  document.getElementById('bdDeckArea').textContent = fmtN(deckArea) + ' sq ft';
  document.getElementById('bdBoards').textContent = fmtN(totalBoards) + ' × ' + boardLen + ' ft';
  document.getElementById('bdLinearFt').textContent = fmtFt(totalBoardLF);
  document.getElementById('bdJoists').textContent = fmtN(numJoists) + ' × ' + Math.ceil(length) + ' ft';
  document.getElementById('bdJoistLF').textContent = fmtFt(totalJoistLF);
  document.getElementById('bdScrews').textContent = fmtN(totalScrews) + ' ' + (tr.pieces || 'pcs');

  document.getElementById('bdBoardCost').textContent = fmtUsd(boardCost);
  document.getElementById('bdJoistCost').textContent = fmtUsd(joistCost);
  document.getElementById('bdScrewCost').textContent = fmtUsd(screwCost);
  document.getElementById('bdTotal').textContent = fmtUsd(totalCost);

  document.getElementById('result').classList.add('show');
}

window.calculate = calculate;
window.copyShareLink = copyShareLink;
window.readUrlParams = readUrlParams;

document.addEventListener('DOMContentLoaded', function() {
  ['deckLength','deckWidth','boardType','boardLength','gap','joistSpacing','boardPrice','joistPrice','screwPrice'].forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('input', calculate);
      el.addEventListener('change', calculate);
    }
  });
});