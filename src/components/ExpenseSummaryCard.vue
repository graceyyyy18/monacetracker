<template>
  <div class="summary-card">
    <span>Total Expenses</span>
    <h1>₱{{ formatMoney(totalExpenses) }}</h1>
  </div>
</template>

<script setup lang="ts">
interface Props {
  totalExpenses: number
}

const props = defineProps<Props>()

const formatMoney = (amount: number) => {
  return Number(amount).toLocaleString('en-PH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}
</script>

<style scoped>
.summary-card {
  background: white;
  padding: 22px;
  border-radius: 18px;
  margin-bottom: 18px;
  box-shadow: 0 5px 18px rgba(0, 0, 0, 0.06);
}

.summary-card span {
  color: #777;
  font-size: 14px;
}

.summary-card h1 {
  margin: 8px 0 0;
  font-size: 30px;
}
</style>
