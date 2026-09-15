<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Personal Expense Tracker</ion-title>
        <ion-buttons slot="end">
          <ion-button color="medium" @click="logout">Logout</ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <ExpenseSummaryCard :total-expenses="totalExpenses" />

      <ion-button expand="block" @click="openAddForm">
        <ion-icon :icon="addOutline" slot="start" />
        Add Expense
      </ion-button>

      <ion-searchbar v-model="searchText" placeholder="Search expenses..." />

      <ion-item>
        <ion-select v-model="selectedCategory" label="Category" label-placement="stacked">
          <ion-select-option value="All">All Categories</ion-select-option>
          <ion-select-option value="Food">Food</ion-select-option>
          <ion-select-option value="Transportation">Transportation</ion-select-option>
          <ion-select-option value="Bills">Bills</ion-select-option>
          <ion-select-option value="Shopping">Shopping</ion-select-option>
          <ion-select-option value="School">School</ion-select-option>
          <ion-select-option value="Entertainment">Entertainment</ion-select-option>
          <ion-select-option value="Health">Health</ion-select-option>
          <ion-select-option value="Others">Others</ion-select-option>
        </ion-select>
      </ion-item>

      <ExpenseList
        :expenses="filteredExpenses"
        @edit="editExpense"
        @delete="deleteExpense"
      />

      <ExpenseFormModal
        :is-open="showModal"
        :editing-id="editingId"
        :form="form"
        @update:form="form = $event"
        @close="closeModal"
        @save="saveExpense"
      />
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonIcon,
  IonSearchbar,
  IonItem,
  IonSelect,
  IonSelectOption,
  IonButtons,
} from '@ionic/vue'
import { addOutline } from 'ionicons/icons'
import { ref as firebaseRef, push, set, update, remove, onValue } from 'firebase/database'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { auth, db } from '../firebase'
import { useRouter } from 'vue-router'
import ExpenseSummaryCard from '../components/ExpenseSummaryCard.vue'
import ExpenseList from '../components/ExpenseList.vue'
import ExpenseFormModal from '../components/ExpenseFormModal.vue'

interface Expense {
  id: string
  expenseName: string
  amount: number
  category: string
  date: string
  notes: string
}

/* ----------------------------- Variables ----------------------------- */
const router = useRouter()
const expenses = ref<Expense[]>([])
const showModal = ref(false)
const editingId = ref<string | null>(null)
const searchText = ref('')
const selectedCategory = ref('All')

const getUserExpensePath = () => {
  const uid = auth.currentUser?.uid
  if (!uid) {
    return null
  }

  return `expenses/${uid}`
}

/* ----------------------------- Form ----------------------------- */
const form = ref({
  expenseName: '',
  amount: 0,
  category: 'Food',
  date: new Date().toISOString().split('T')[0],
  notes: '',
})

/* ----------------------------- Load Firebase Data ----------------------------- */
const loadExpenses = (uid?: string) => {
  const userId = uid ?? auth.currentUser?.uid

  if (!userId) {
    expenses.value = []
    return
  }

  const expensesRef = firebaseRef(db, `expenses/${userId}`)

  onValue(expensesRef, (snapshot) => {
    const data = snapshot.val()

    if (!data) {
      expenses.value = []
      return
    }

    expenses.value = Object.entries(data).map(([id, value]: any) => ({
      id,
      expenseName: value.expenseName || '',
      amount: Number(value.amount) || 0,
      category: value.category || 'Others',
      date: value.date || '',
      notes: value.notes || '',
    }))
  })
}

/* ----------------------------- Total Expenses ----------------------------- */
const totalExpenses = computed(() => {
  return expenses.value.reduce((total, expense) => total + Number(expense.amount), 0)
})

/* ----------------------------- Filter ----------------------------- */
const filteredExpenses = computed(() => {
  let result = [...expenses.value]

  /* Category */
  if (selectedCategory.value !== 'All') {
    result = result.filter((expense) => expense.category === selectedCategory.value)
  }

  /* Search */
  if (searchText.value.trim()) {
    const search = searchText.value.toLowerCase()
    result = result.filter(
      (expense) =>
        expense.expenseName.toLowerCase().includes(search) ||
        expense.category.toLowerCase().includes(search) ||
        expense.notes.toLowerCase().includes(search),
    )
  }

  /* Newest first */
  return result.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
})

/* ----------------------------- Open Add Form ----------------------------- */
const openAddForm = () => {
  editingId.value = null
  form.value = {
    expenseName: '',
    amount: 0,
    category: 'Food',
    date: new Date().toISOString().split('T')[0],
    notes: '',
  }
  showModal.value = true
}

/* ----------------------------- Edit Expense ----------------------------- */
const editExpense = (expense: Expense) => {
  editingId.value = expense.id
  form.value = {
    expenseName: expense.expenseName,
    amount: expense.amount,
    category: expense.category,
    date: expense.date,
    notes: expense.notes,
  }
  showModal.value = true
}

/* ----------------------------- Close Modal ----------------------------- */
const closeModal = () => {
  showModal.value = false
}

/* ----------------------------- Save Expense ----------------------------- */
const saveExpense = async () => {
  const uid = auth.currentUser?.uid

  if (!uid) {
    alert('Please login first.')
    router.push('/login')
    return
  }

  if (!form.value.expenseName.trim()) {
    alert('Please enter an expense name.')
    return
  }

  if (!form.value.amount || form.value.amount <= 0) {
    alert('Please enter a valid amount.')
    return
  }

  try {
    const expensePath = `expenses/${uid}`

    /* EDIT */
    if (editingId.value) {
      const expenseRef = firebaseRef(db, `${expensePath}/${editingId.value}`)
      await update(expenseRef, {
        expenseName: form.value.expenseName,
        amount: form.value.amount,
        category: form.value.category,
        date: form.value.date,
        notes: form.value.notes,
      })
    }
    /* ADD */
    else {
      const expenseRef = push(firebaseRef(db, expensePath))
      await set(expenseRef, {
        expenseName: form.value.expenseName,
        amount: form.value.amount,
        category: form.value.category,
        date: form.value.date,
        notes: form.value.notes,
      })
    }

    closeModal()
  } catch (error) {
    console.error(error)
    alert('Failed to save expense.')
  }
}

/* ----------------------------- Delete ----------------------------- */
const deleteExpense = async (id: string) => {
  const uid = auth.currentUser?.uid

  if (!uid) {
    router.push('/login')
    return
  }

  const confirmed = confirm('Are you sure you want to delete this expense?')
  if (!confirmed) return

  try {
    await remove(firebaseRef(db, `expenses/${uid}/${id}`))
  } catch (error) {
    console.error(error)
    alert('Failed to delete expense.')
  }
}

const logout = async () => {
  try {
    await signOut(auth)
    router.push('/login')
  } catch (error) {
    console.error(error)
    alert('Failed to logout.')
  }
}

/* ----------------------------- Start ----------------------------- */
onMounted(() => {
  onAuthStateChanged(auth, (user) => {
    if (!user) {
      router.replace('/login')
      return
    }

    loadExpenses(user.uid)
  })
})
</script>

<style scoped>
ion-content {
  --background: #f5f7fb;
}

ion-searchbar {
  --background: white;
  padding-left: 0;
  padding-right: 0;
  margin-top: 12px;
}
</style>
