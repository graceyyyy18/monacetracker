<template>
  <div class="summary-card">
    <div class="summary-label-row">
      <span class="summary-label">Total Expenses</span>
      <span class="summary-badge">This month</span>
    </div>
    <h1>₱{{ formatMoney(totalExpenses) }}</h1>
  </div>
</template>

<script setup lang="ts">
interface Props {
  totalExpenses: number
}

defineProps<Props>()

const formatMoney = (amount: number) => {
  return Number(amount).toLocaleString('en-PH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}
</script>

<style scoped>
.summary-card {
  position: relative;
  overflow: hidden;
  background: linear-gradient(135deg, #5b21b6 0%, #7c3aed 62%, #8b5cf6 100%);
  border: 0;
  padding: 22px 24px 24px;
  border-radius: 16px;
  margin-bottom: 18px;
  box-shadow: 0 10px 24px rgba(124, 58, 237, 0.2);
}

.summary-card::after {
  position: absolute;
  right: -25px;
  bottom: -52px;
  width: 220px;
  height: 120px;
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 50%;
  content: '';
  transform: rotate(-12deg);
}

.summary-label-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 14px;
}

.summary-label {
  color: #ede9fe;
  font-size: 0.82rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.summary-badge {
  background: rgba(255, 255, 255, 0.2);
  color: #ffffff;
  border: 1px solid rgba(255, 255, 255, 0.25);
  padding: 6px 10px;
  border-radius: 999px;
  font-size: 0.72rem;
  font-weight: 700;
}

.summary-card h1 {
  margin: 0;
  font-size: clamp(2.1rem, 5vw, 2.8rem);
  color: #ffffff;
  letter-spacing: -0.05em;
}
</style>
