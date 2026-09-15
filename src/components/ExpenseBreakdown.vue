<template>
  <section class="breakdown-card" aria-labelledby="breakdown-title">
    <div class="panel-heading">
      <div>
        <p class="eyebrow">Expense breakdown</p>
        <h2 id="breakdown-title">By category</h2>
      </div>
      <ion-icon :icon="pieChartOutline" aria-hidden="true" />
    </div>

    <div v-if="categoryTotals.length" class="breakdown-body">
      <div class="donut" :style="donutStyle">
        <div class="donut-center">
          <strong>₱{{ formatMoney(total) }}</strong>
          <span>Total expenses</span>
        </div>
      </div>

      <div class="legend">
        <div v-for="item in categoryTotals" :key="item.category" class="legend-row">
          <span class="legend-name">
            <i :style="{ background: item.color }" />
            {{ item.category }}
          </span>
          <strong>{{ formatLegendAmount(item.amount) }}</strong>
          <span class="legend-percent">{{ item.percent }}%</span>
        </div>
      </div>
    </div>

    <div v-else class="empty-breakdown">
      <ion-icon :icon="pieChartOutline" aria-hidden="true" />
      <span>Add an expense to see the breakdown.</span>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { IonIcon } from '@ionic/vue'
import { pieChartOutline } from 'ionicons/icons'

interface Expense {
  amount: number
  category: string
}

const props = defineProps<{ expenses: Expense[] }>()

const colors = ['#7c3aed', '#4f46e5', '#a78bfa', '#c4b5fd', '#ddd6fe', '#8b5cf6']

const categoryTotals = computed(() => {
  const totals = props.expenses.reduce<Record<string, number>>((result, expense) => {
    result[expense.category] = (result[expense.category] || 0) + Number(expense.amount)
    return result
  }, {})
  const total = Object.values(totals).reduce((sum, amount) => sum + amount, 0)

  return Object.entries(totals)
    .map(([category, amount], index) => ({
      category,
      amount,
      percent: total ? Math.round((amount / total) * 100) : 0,
      color: colors[index % colors.length],
    }))
    .sort((a, b) => b.amount - a.amount)
})

const total = computed(() => categoryTotals.value.reduce((sum, item) => sum + item.amount, 0))

const donutStyle = computed(() => {
  let start = 0
  const stops = categoryTotals.value.map((item) => {
    const end = start + item.percent
    const value = `${item.color} ${start}% ${end}%`
    start = end
    return value
  })

  return { background: `conic-gradient(${stops.join(', ')})` }
})

const formatMoney = (amount: number) =>
  Number(amount).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

const formatLegendAmount = (amount: number) => {
  if (amount >= 1_000_000) return `₱${(amount / 1_000_000).toFixed(1)}m`
  if (amount >= 1_000) return `₱${(amount / 1_000).toFixed(1)}k`
  return `₱${Math.round(amount).toLocaleString('en-PH')}`
}
</script>

<style scoped>
.breakdown-card {
  height: 100%;
  box-sizing: border-box;
  padding: 20px;
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  background: #ffffff;
  box-shadow: 0 8px 24px rgba(30, 27, 75, 0.06);
}

.panel-heading {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
}

.eyebrow {
  margin: 0 0 5px;
  color: #7c3aed;
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

h2 {
  margin: 0;
  color: #1e1b4b;
  font-size: 1.1rem;
}

.panel-heading ion-icon {
  color: #7c3aed;
  font-size: 1.4rem;
}

.breakdown-body {
  display: grid;
  grid-template-columns: minmax(130px, 168px) minmax(0, 1fr);
  align-items: center;
  gap: 22px;
  margin-top: 25px;
}

.donut {
  display: grid;
  width: min(100%, 168px);
  aspect-ratio: 1;
  height: auto;
  flex: 0 0 auto;
  place-items: center;
  border-radius: 50%;
}

.donut-center {
  display: flex;
  width: 104px;
  height: 104px;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: #ffffff;
  color: #6b7280;
  text-align: center;
}

.donut-center strong {
  color: #1e1b4b;
  font-size: 0.95rem;
}

.donut-center span {
  margin-top: 3px;
  font-size: 0.67rem;
}

.legend {
  display: flex;
  min-width: 0;
  flex: 1;
  flex-direction: column;
  gap: 11px;
}

.legend-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) max-content max-content;
  align-items: center;
  gap: 8px;
  color: #6b7280;
  font-size: 0.73rem;
}

.legend-name {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 7px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.legend-name i {
  width: 8px;
  height: 8px;
  flex: 0 0 auto;
  border-radius: 50%;
}

.legend-row strong {
  max-width: 70px;
  overflow: hidden;
  color: #1e1b4b;
  font-size: 0.72rem;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.legend-percent {
  min-width: 32px;
  color: #7c3aed;
  text-align: right;
}

.empty-breakdown {
  display: flex;
  min-height: 180px;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: #6b7280;
  font-size: 0.82rem;
}

.empty-breakdown ion-icon {
  color: #7c3aed;
  font-size: 1.5rem;
}

@media (max-width: 900px) {
  .breakdown-body {
    grid-template-columns: minmax(120px, 150px) minmax(0, 1fr);
    gap: 16px;
  }

  .donut {
    width: 150px;
    align-self: center;
  }
}

@media (max-width: 480px) {
  .breakdown-body {
    grid-template-columns: 1fr;
  }

  .donut {
    width: 150px;
  }

  .legend {
    width: 100%;
  }
}
</style>
