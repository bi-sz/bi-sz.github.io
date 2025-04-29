// js/rader.js

// 각도(deg) → 라디안 변환
function toRadians(deg) {
    return deg * Math.PI / 180;
  }
  
  // 버튼 클릭 시 호출되는 계산 함수
  function calculate() {
    const r1  = parseFloat(document.getElementById("r1").value);
    const t1  = parseFloat(document.getElementById("theta1").value);
    const r2  = parseFloat(document.getElementById("r2").value);
    const t2  = parseFloat(document.getElementById("theta2").value);
    const dt  = parseFloat(document.getElementById("deltaT").value);
    let result = "";
  
    const hasR1     = !isNaN(r1);
    const hasR2     = !isNaN(r2);
    const hasT1     = !isNaN(t1);
    const hasT2     = !isNaN(t2);
    const hasDeltaT = !isNaN(dt) && dt !== 0;
  
    if (hasR1 && hasR2 && hasT1 && hasT2 && hasDeltaT) {
      // 전체 계산
      const x1 = r1 * Math.cos(toRadians(t1));
      const y1 = r1 * Math.sin(toRadians(t1));
      const x2 = r2 * Math.cos(toRadians(t2));
      const y2 = r2 * Math.sin(toRadians(t2));
      const dx = x2 - x1;
      const dy = y2 - y1;
      const dist = Math.hypot(dx, dy);
      const speed = dist / dt;
      result = `총 이동 거리: ${dist.toFixed(2)} m<br>속도: ${speed.toFixed(2)} m/s`;
  
    } else if (hasR1 && hasR2 && hasDeltaT) {
      // 거리 변화량 + 속도 (방향 생략)
      const dist = Math.abs(r2 - r1);
      const speed = dist / dt;
      result = `거리 변화량: ${dist.toFixed(2)} m<br>속도(방향 미포함): ${speed.toFixed(2)} m/s`;
  
    } else if (hasR1 && hasT1 && hasR2 && hasT2) {
      // 거리 + 방향만
      const x1 = r1 * Math.cos(toRadians(t1));
      const y1 = r1 * Math.sin(toRadians(t1));
      const x2 = r2 * Math.cos(toRadians(t2));
      const y2 = r2 * Math.sin(toRadians(t2));
      const dist = Math.hypot(x2 - x1, y2 - y1);
      result = `방향 포함 거리 차이: ${dist.toFixed(2)} m<br>(시간 정보 없으므로 속도 계산 불가)`;
  
    } else if (hasR1 && hasR2) {
      // 거리 차이만
      const dist = Math.abs(r2 - r1);
      result = `거리 차이: ${dist.toFixed(2)} m<br>(각도·시간 정보 없음)`;
  
    } else {
      result = "계산에 필요한 값이 부족합니다.<br>최소 두 값 이상 입력해 주세요.";
    }
  
    document.getElementById("result").innerHTML = result;
  }
  
  
  // 레이더 애니메이션 + 점 시각화
  window.onload = function() {
    const canvas = document.getElementById("raderCanvas");
    const ctx    = canvas.getContext("2d");
    const cx     = canvas.width  / 2;
    const cy     = canvas.height / 2;
    const radius = Math.min(cx, cy) - 10;
    const scale  = 1;   // 1m → 1px, 필요시 조정
    let angle    = 0;
  
    function drawRadar() {
      // 클리어
      ctx.clearRect(0, 0, canvas.width, canvas.height);
  
      // 배경
      ctx.fillStyle = "#000";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
  
      // 동심원
      ctx.strokeStyle = "lime";
      ctx.lineWidth   = 1;
      for (let r = 50; r <= radius; r += 50) {
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, 2 * Math.PI);
        ctx.stroke();
      }
  
      // 십자선
      ctx.beginPath();
      ctx.moveTo(cx - radius, cy); ctx.lineTo(cx + radius, cy);
      ctx.moveTo(cx, cy - radius); ctx.lineTo(cx, cy + radius);
      ctx.stroke();
  
      // 회전 선
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(angle);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(radius, 0);
      ctx.strokeStyle = "lime";
      ctx.lineWidth   = 2;
      ctx.stroke();
      ctx.restore();
      angle += 0.02;
  
      // 점 A
      const r1  = parseFloat(document.getElementById("r1").value);
      const t1  = parseFloat(document.getElementById("theta1").value);
      if (!isNaN(r1) && !isNaN(t1)) {
        const x1 = cx + scale * r1 * Math.cos(toRadians(t1));
        const y1 = cy + scale * r1 * Math.sin(toRadians(t1));
        ctx.fillStyle = "red";
        ctx.beginPath();
        ctx.arc(x1, y1, 5, 0, 2 * Math.PI);
        ctx.fill();
      }
  
      // 점 B
      const r2  = parseFloat(document.getElementById("r2").value);
      const t2  = parseFloat(document.getElementById("theta2").value);
      if (!isNaN(r2) && !isNaN(t2)) {
        const x2 = cx + scale * r2 * Math.cos(toRadians(t2));
        const y2 = cy + scale * r2 * Math.sin(toRadians(t2));
        ctx.fillStyle = "cyan";
        ctx.beginPath();
        ctx.arc(x2, y2, 5, 0, 2 * Math.PI);
        ctx.fill();
      }
    }
  
    // 30ms마다 레이더 갱신
    setInterval(drawRadar, 30);
  };
  