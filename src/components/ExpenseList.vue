<template>
  <div class="expense-list">
    <div v-for="expense in expenses" :key="expense.id" class="expense-card">
      <div class="expense-icon">
        {{ getCategoryIcon(expense.category) }}
      </div>

      <div class="expense-details">
        <h2>{{ expense.expenseName }}</h2>
        <p>{{ expense.category }} • {{ expense.date }}</p>
        <p v-if="expense.notes" class="notes">{{ expense.notes }}</p>
      </div>

      <div class="expense-actions">
        <strong>₱{{ formatMoney(expense.amount) }}</strong>
        <div>
          <ion-button fill="clear" size="small" @click="emit('edit', expense)">
            Edit
          </ion-button>
          <ion-button fill="clear" color="danger" size="small" @click="emit('delete', expense.id)">
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
import { IonButton } from '@ionic/vue'

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
  const icons: Record<string, string> = {
    Food: '🍔',
    Transportation: '🚌',
    Bills: '💡',
    Shopping: '🛍️',
    School: '🎓',
    Entertainment: '🎮',
    Health: '💊',
    Others: '📦',
  }

  return icons[category] || '💰'
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
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
}

.expense-icon {
  width: 46px;
  height: 46px;
  border-radius: 13px;
  background: #f1f5f9;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
}

.expense-details {
  flex: 1;
}

.expense-details h2 {
  margin: 0;
  font-size: 16px;
}

.expense-details p {
  margin: 5px 0 0;
  color: #777;
  font-size: 13px;
}

.expense-details .notes {
  color: #999;
}

.expense-actions {
  text-align: right;
}

.expense-actions strong {
  display: block;
  color: #dc2626;
  font-size: 16px;
}

.empty-state {
  text-align: center;
  padding: 50px 20px;
  color: #777;
}

.empty-icon {
  font-size: 45px;
}

.empty-state h2 {
  color: #333;
}

@media (max-width: 600px) {
  .expense-card {
    align-items: flex-start;
  }

  .expense-actions {
    min-width: 105px;
  }
}
</style>
