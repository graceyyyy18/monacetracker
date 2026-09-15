<template>
  <section class="analytics-panel" aria-labelledby="analytics-title">
    <div class="panel-heading">
      <div>
        <p class="eyebrow">Spending snapshot</p>
        <h2 id="analytics-title">Where your money goes</h2>
      </div>
      <span class="period-label">By category</span>
    </div>

    <div v-if="categoryTotals.length" class="chart-area">
      <div class="chart-bars" aria-label="Expense totals by category">
        <div v-for="item in categoryTotals" :key="item.category" class="bar-column">
          <span class="bar-value">₱{{ formatCompact(item.amount) }}</span>
          <div class="bar-track">
            <div
              class="bar-fill"
              :style="{ height: `${item.percent}%`, background: item.color }"
            />
          </div>
          <span class="bar-label">{{ item.category }}</span>
        </div>
      </div>

      <div class="insight-row">
        <div>
          <span class="insight-label">Top category</span>
          <strong>{{ categoryTotals[0].category }}</strong>
        </div>
        <div class="insight-value">
          <span class="insight-label">Share of spend</span>
          <strong>{{ categoryTotals[0].percent }}%</strong>
        </div>
      </div>
    </div>

    <div v-else class="empty-analytics">
      <span class="empty-chart-icon">◌</span>
      <p>Add an expense to see your spending pattern.</p>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Expense {
  amount: number
  category: string
}

interface Props {
  expenses: Expense[]
}

const props = defineProps<Props>()

const categoryColors: Record<string, string> = {
  Food: 'linear-gradient(180deg, #a78bfa, #7c3aed)',
  Transportation: 'linear-gradient(180deg, #60a5fa, #2563eb)',
  Bills: 'linear-gradient(180deg, #fbbf24, #d97706)',
  Shopping: 'linear-gradient(180deg, #fb7185, #e11d48)',
  School: 'linear-gradient(180deg, #34d399, #059669)',
  Entertainment: 'linear-gradient(180deg, #f472b6, #be185d)',
  Health: 'linear-gradient(180deg, #2dd4bf, #0f766e)',
  Others: 'linear-gradient(180deg, #94a3b8, #475569)',
}

const categoryTotals = computed(() => {
  const totals = props.expenses.reduce<Record<string, number>>((result, expense) => {
    result[expense.category] = (result[expense.category] || 0) + Number(expense.amount)
    return result
  }, {})
  const total = Object.values(totals).reduce((sum, amount) => sum + amount, 0)

  return Object.entries(totals)
    .map(([category, amount]) => ({
      category,
      amount,
      percent: total ? Math.max(8, Math.round((amount / total) * 100)) : 0,
      color: categoryColors[category] || categoryColors.Others,
    }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5)
})

const formatCompact = (amount: number) => {
  if (amount >= 1000) return `${(amount / 1000).toFixed(1)}k`
  return Math.round(amount).toLocaleString('en-PH')
}
</script>

<style scoped>
.analytics-panel {
  margin-top: 18px;
  padding: 20px;
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  background: #ffffff;
  box-shadow: 0 8px 24px rgba(30, 27, 75, 0.06);
}

.panel-heading,
.insight-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.eyebrow,
.insight-label {
  margin: 0 0 6px;
  color: #7c3aed;
  font-size: 0.68rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

h2 {
  margin: 0;
  color: #1e1b4b;
  font-size: 1.12rem;
}

.period-label {
  padding: 7px 10px;
  border: 1px solid #e5e7eb;
  border-radius: 999px;
  color: #6b7280;
  font-size: 0.72rem;
  white-space: nowrap;
}

.chart-area {
  margin-top: 24px;
}

.chart-bars {
  display: grid;
  grid-template-columns: repeat(5, minmax(42px, 1fr));
  align-items: end;
  gap: 12px;
  min-height: 172px;
  padding: 0 4px;
}

.bar-column {
  display: flex;
  min-width: 0;
  height: 172px;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  gap: 7px;
}

.bar-value {
  color: #6d28d9;
  font-size: 0.67rem;
  white-space: nowrap;
}

.bar-track {
  display: flex;
  width: 100%;
  max-width: 34px;
  height: 112px;
  align-items: flex-end;
  overflow: hidden;
  border-radius: 12px;
  background: #f3e8ff;
}

.bar-fill {
  width: 100%;
  min-height: 8px;
  border-radius: 12px;
  box-shadow: 0 4px 10px rgba(124, 58, 237, 0.16);
  transition: height 300ms ease;
}

.bar-label {
  width: 100%;
  overflow: hidden;
  color: #6b7280;
  font-size: 0.68rem;
  text-align: center;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.insight-row {
  margin-top: 22px;
  padding-top: 16px;
  border-top: 1px solid #e5e7eb;
}

.insight-row strong {
  color: #1e1b4b;
  font-size: 0.95rem;
}

.insight-value {
  text-align: right;
}

.empty-analytics {
  display: grid;
  min-height: 150px;
  place-items: center;
  align-content: center;
  gap: 8px;
  color: #6b7280;
  text-align: center;
}

.empty-chart-icon {
  color: #7c3aed;
  font-size: 2.4rem;
}

.empty-analytics p {
  margin: 0;
  font-size: 0.84rem;
}

@media (min-width: 768px) {
  .analytics-panel {
    padding: 24px;
  }

  .chart-bars {
    gap: 24px;
  }

  .bar-track {
    max-width: 42px;
  }
}
</style>
