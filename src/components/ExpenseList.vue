<template>
  <div class="expense-list">
    <div v-for="expense in expenses" :key="expense.id" class="expense-card">
      <div class="expense-icon">
        <ion-icon :icon="getCategoryIcon(expense.category)" :aria-label="`${expense.category} category`" />
      </div>

      <div class="expense-details">
        <h2>{{ expense.expenseName }}</h2>
        <div class="meta-row">
          <span class="meta-pill">{{ expense.category }}</span>
          <span class="meta-date">{{ expense.date }}</span>
        </div>
        <p v-if="expense.notes" class="notes">{{ expense.notes }}</p>
      </div>

      <div class="expense-actions">
        <strong>₱{{ formatMoney(expense.amount) }}</strong>
        <div class="button-row">
          <ion-button fill="clear" size="small" aria-label="Edit expense" @click="emit('edit', expense)">
            <ion-icon :icon="createOutline" slot="start" />
            Edit
          </ion-button>
          <ion-button fill="clear" color="danger" size="small" aria-label="Delete expense" @click="emit('delete', expense.id)">
            <ion-icon :icon="trashOutline" slot="start" />
            Delete
          </ion-button>
        </div>
      </div>
    </div>

    <div v-if="expenses.length === 0" class="empty-state">
      <div class="empty-icon">💸</div>
      <h2>No Expenses Found</h2>
      <p>Add your first expense to start tracking your spending.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { IonButton, IonIcon } from '@ionic/vue'
import {
  bagHandleOutline,
  carOutline,
  createOutline,
  gameControllerOutline,
  medicalOutline,
  receiptOutline,
  restaurantOutline,
  trashOutline,
  walletOutline,
} from 'ionicons/icons'

interface Expense {
  id: string
  expenseName: string
  amount: number
  category: string
  date: string
  notes: string
}

interface Props {
  expenses: Expense[]
}

defineProps<Props>()
const emit = defineEmits<{
  edit: [expense: Expense]
  delete: [id: string]
}>()

const formatMoney = (amount: number) => {
  return Number(amount).toLocaleString('en-PH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

const getCategoryIcon = (category: string) => {
  const icons = {
    Food: restaurantOutline,
    Transportation: carOutline,
    Bills: receiptOutline,
    Shopping: bagHandleOutline,
    School: receiptOutline,
    Entertainment: gameControllerOutline,
    Health: medicalOutline,
    Others: walletOutline,
  }

  return icons[category as keyof typeof icons] || walletOutline
}
</script>

<style scoped>
.expense-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 18px;
}

.expense-card {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  box-shadow: 0 8px 24px rgba(30, 27, 75, 0.06);
  transition: transform 180ms ease, box-shadow 180ms ease;
}

.expense-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 28px rgba(30, 27, 75, 0.1);
}

.expense-icon {
  width: 48px;
  height: 48px;
  border-radius: 14px;
  background: #f3e8ff;
  border: 1px solid #e9d5ff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
}

.expense-icon ion-icon {
  color: #7c3aed;
  font-size: 1.3rem;
}

.expense-details {
  flex: 1;
}

.expense-details h2 {
  margin: 0;
  font-size: 1.05rem;
  color: #1e1b4b;
}

.meta-row {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  margin-top: 8px;
}

.meta-pill {
  background: #f3e8ff;
  color: #6d28d9;
  border: 1px solid #e9d5ff;
  border-radius: 999px;
  padding: 4px 8px;
  font-size: 0.68rem;
  font-weight: 700;
  text-transform: uppercase;
}

.meta-date {
  color: #6b7280;
  font-size: 0.76rem;
}

.expense-details p {
  margin: 8px 0 0;
  color: #6b7280;
  font-size: 0.8rem;
}

.expense-details .notes {
  color: #6b7280;
}

.expense-actions {
  text-align: right;
}

.expense-actions strong {
  display: block;
  color: #4f46e5;
  font-size: 1.1rem;
  margin-bottom: 8px;
}

.button-row {
  display: flex;
  justify-content: flex-end;
  gap: 4px;
}

.button-row ion-button {
  --color: #7c3aed;
  --padding-start: 8px;
  --padding-end: 8px;
  margin: 0;
  font-size: 0.75rem;
  font-weight: 700;
}

.button-row ion-button[color='danger'] {
  --color: #ef4444;
}

.empty-state {
  text-align: center;
  padding: 56px 20px 32px;
  color: #6b7280;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  box-shadow: 0 8px 24px rgba(30, 27, 75, 0.06);
}

.empty-icon {
  font-size: 42px;
}

.empty-state h2 {
  color: #1e1b4b;
}

@media (max-width: 600px) {
  .expense-card {
    align-items: flex-start;
    flex-wrap: wrap;
  }

  .expense-actions {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    padding-left: 62px;
    text-align: left;
  }

  .expense-actions strong {
    margin-bottom: 0;
  }
}
</style>
