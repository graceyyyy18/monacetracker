<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <div class="header-brand">
          <div class="brand-mark">M</div>
          <div class="brand-copy">
            <span>Monace Tracker</span>
            <small>Your money, in control.</small>
          </div>
        </div>
        <div class="header-user" slot="end">
          <div class="user-avatar">{{ userInitial }}</div>
          <span>{{ userName }}</span>
        </div>
        <ion-buttons slot="end">
          <ion-button
            class="logout-button"
            fill="clear"
            aria-label="Logout"
            title="Logout"
            @click="logout"
          >
            <ion-icon :icon="logOutOutline" aria-hidden="true" />
            <span>Logout</span>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <main id="dashboard" class="dashboard-shell">
        <section class="dashboard-intro">
          <div>
            <p class="eyebrow">Personal finance</p>
            <h1>Good evening, {{ userName }} 👋</h1>
            <p class="intro-copy">Track your expenses and stay close to your money.</p>
          </div>
          <ion-button class="primary-add-button" aria-label="Add expense" @click="openAddForm">
            <ion-icon :icon="addOutline" slot="start" />
            <span>Add Expense</span>
          </ion-button>
        </section>

        <section class="summary-grid">
          <ExpenseSummaryCard :total-expenses="totalExpenses" />
          <article class="stat-card">
            <div class="stat-icon"><ion-icon :icon="receiptOutline" aria-hidden="true" /></div>
            <div><span>Total transactions</span><strong>{{ expenses.length }}</strong><small>expense entries</small></div>
          </article>
          <article class="stat-card">
            <div class="stat-icon"><ion-icon :icon="pricetagOutline" aria-hidden="true" /></div>
            <div><span>Top category</span><strong>{{ topCategory }}</strong><small>{{ topCategoryShare }}% of your spending</small></div>
          </article>
        </section>

        <section id="analytics" class="analytics-grid">
          <ExpenseAnalytics :expenses="expenses" />
          <ExpenseBreakdown :expenses="expenses" />
        </section>

        <section id="transactions" class="transactions-section">
          <div class="section-heading">
            <div>
              <p class="eyebrow">Activity</p>
              <h2>Recent expenses</h2>
            </div>
            <span class="transaction-count">{{ filteredExpenses.length }} transactions</span>
          </div>

          <div class="filter-toolbar">
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
          </div>

          <ExpenseList
            :expenses="filteredExpenses"
            @edit="editExpense"
            @delete="deleteExpense"
          />
        </section>
      </main>

      <ion-fab class="mobile-fab" slot="fixed" vertical="bottom" horizontal="end">
        <ion-fab-button aria-label="Add expense" @click="openAddForm">
          <ion-icon :icon="addOutline" />
        </ion-fab-button>
      </ion-fab>

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
  IonContent,
  IonButton,
  IonIcon,
  IonSearchbar,
  IonItem,
  IonSelect,
  IonSelectOption,
  IonButtons,
  IonFab,
  IonFabButton,
} from '@ionic/vue'
import { addOutline, logOutOutline, pricetagOutline, receiptOutline } from 'ionicons/icons'
import { ref as firebaseRef, push, set, update, remove, onValue } from 'firebase/database'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { auth, db } from '../firebase'
import { useRouter } from 'vue-router'
import ExpenseSummaryCard from '../components/ExpenseSummaryCard.vue'
import ExpenseAnalytics from '../components/ExpenseAnalytics.vue'
import ExpenseBreakdown from '../components/ExpenseBreakdown.vue'
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
const userName = ref('User')

const userInitial = computed(() => userName.value.charAt(0).toUpperCase() || 'U')

const getUserName = (user: { displayName: string | null; email: string | null }) => {
  if (user.displayName?.trim()) return user.displayName.trim()

  const emailName = user.email?.split('@')[0]?.replace(/[._-]+/g, ' ').trim()
  if (!emailName) return 'User'

  return emailName.replace(/\b\w/g, (letter) => letter.toUpperCase())
}

const categoryTotals = computed(() => expenses.value.reduce<Record<string, number>>((result, expense) => {
  result[expense.category] = (result[expense.category] || 0) + Number(expense.amount)
  return result
}, {}))

const topCategory = computed(() => {
  const entries = Object.entries(categoryTotals.value).sort((a, b) => b[1] - a[1])
  return entries[0]?.[0] || 'None yet'
})

const topCategoryShare = computed(() => {
  const total = totalExpenses.value
  const topAmount = categoryTotals.value[topCategory.value] || 0
  return total ? Math.round((topAmount / total) * 100) : 0
})

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

    userName.value = getUserName(user)
    loadExpenses(user.uid)
  })
})
</script>

<style scoped>
ion-content {
  --background: #f8f7fc;
}

.dashboard-shell {
  width: min(100%, 1160px);
  margin: 0 auto;
  padding: 24px 0 48px;
}

.dashboard-intro,
.section-heading {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 24px;
}

.dashboard-intro {
  margin-bottom: 24px;
}

.eyebrow {
  margin: 0 0 6px;
  color: #7c3aed;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.dashboard-intro h1,
.section-heading h2 {
  margin: 0;
  color: #1e1b4b;
  font-weight: 750;
}

.dashboard-intro h1 {
  font-size: clamp(1.8rem, 3vw, 2.2rem);
}

.section-heading h2 {
  font-size: 1.35rem;
}

.intro-copy {
  margin: 8px 0 0;
  color: #6b7280;
  font-size: 0.95rem;
}

.summary-grid {
  display: grid;
  grid-template-columns: minmax(300px, 1.55fr) repeat(2, minmax(210px, 1fr));
  align-items: stretch;
  gap: 18px;
  margin-bottom: 32px;
}

.summary-grid :deep(.summary-card),
.stat-card {
  height: 100%;
  box-sizing: border-box;
}

.summary-grid :deep(.summary-card) {
  margin-bottom: 0;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 22px;
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  background: #ffffff;
  box-shadow: 0 8px 24px rgba(30, 27, 75, 0.06);
}

.stat-card > div:last-child {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 4px;
}

.stat-card span,
.stat-card small {
  color: #6b7280;
  font-size: 0.73rem;
}

.stat-card strong {
  overflow: hidden;
  color: #1e1b4b;
  font-size: 1.28rem;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.stat-icon {
  display: grid;
  width: 42px;
  height: 42px;
  flex: 0 0 auto;
  place-items: center;
  border-radius: 50%;
  background: #ede9fe;
  color: #7c3aed;
  font-size: 1.25rem;
}

.analytics-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.65fr) minmax(300px, 0.85fr);
  align-items: stretch;
  gap: 18px;
  margin-bottom: 18px;
}

.analytics-grid :deep(.analytics-panel) {
  margin-top: 0;
}

.transactions-section {
  padding: 24px;
  border: 1px solid #e5e7eb;
  border-radius: 18px;
  background: #ffffff;
  box-shadow: 0 8px 24px rgba(30, 27, 75, 0.05);
}

.transaction-count {
  color: #6b7280;
  font-size: 0.8rem;
}

.filter-toolbar {
  display: grid;
  min-width: 0;
  grid-template-columns: minmax(0, 1fr) 220px;
  align-items: end;
  gap: 12px;
  margin-top: 20px;
}

.filter-toolbar ion-searchbar,
.filter-toolbar ion-item {
  width: 100%;
  box-sizing: border-box;
  margin: 0;
}

ion-toolbar {
  --background: rgba(255, 255, 255, 0.94);
  --color: #1e1b4b;
  --min-height: 64px;
  border-bottom: 1px solid #e5e7eb;
  box-shadow: 0 2px 12px rgba(30, 27, 75, 0.04);
}

.header-brand {
  display: flex;
  align-items: center;
  gap: 10px;
  padding-left: 20px;
}

.header-user {
  display: flex;
  align-items: center;
  gap: 7px;
  margin-right: 14px;
  color: #4b5563;
  font-size: 0.8rem;
  font-weight: 650;
}

.user-avatar {
  display: grid;
  width: 30px;
  height: 30px;
  place-items: center;
  border-radius: 50%;
  background: #ede9fe;
  color: #7c3aed;
  font-weight: 800;
}

.brand-mark {
  display: grid;
  width: 34px;
  height: 34px;
  place-items: center;
  border-radius: 10px;
  background: #7c3aed;
  color: #ffffff;
  font-size: 1rem;
  font-weight: 800;
}

.brand-copy {
  display: flex;
  flex-direction: column;
  gap: 1px;
  color: #1e1b4b;
  font-size: 0.93rem;
  font-weight: 750;
}

.brand-copy small {
  color: #9ca3af;
  font-size: 0.68rem;
  font-weight: 500;
}

ion-header ion-button {
  --color: #6b7280;
}

.logout-button {
  height: 40px;
  margin-right: 12px;
  padding: 0 10px;
  border: 1px solid #e9d5ff;
  border-radius: 12px;
  --color: #7c3aed;
  --background: #f5f3ff;
  --background-hover: #ede9fe;
  --background-activated: #ddd6fe;
  transition: transform 180ms ease, background 180ms ease;
}

.logout-button:hover {
  transform: translateY(-1px);
}

.logout-button ion-icon {
  font-size: 1.15rem;
}

.logout-button span {
  margin-left: 6px;
  font-size: 0.78rem;
  font-weight: 700;
}

ion-searchbar {
  --background: #ffffff;
  --color: #1e1b4b;
  --placeholder-color: #9ca3af;
  --icon-color: #6b7280;
  --clear-button-color: #6b7280;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  margin-top: 12px;
  box-shadow: 0 4px 14px rgba(30, 27, 75, 0.04);
}

.filter-toolbar ion-searchbar {
  --height: 48px;
  margin-top: 0;
}

ion-item {
  --background: #ffffff;
  --border-radius: 16px;
  --inner-border-width: 0;
  margin-top: 12px;
  border: 1px solid #e5e7eb;
  box-shadow: 0 4px 14px rgba(30, 27, 75, 0.04);
}

ion-button {
  --border-radius: 14px;
  --box-shadow: none;
}

ion-button[expand='block'] {
  margin-top: 18px;
  --background: #7c3aed;
  --background-hover: #6d28d9;
  --background-activated: #6d28d9;
  --color: #ffffff;
  font-weight: 700;
  height: 48px;
}

.primary-add-button {
  --background: linear-gradient(135deg, #7c3aed, #6d28d9);
  --background-hover: linear-gradient(135deg, #8b5cf6, #7c3aed);
  --background-activated: #5b21b6;
  --color: #ffffff;
  --padding-start: 18px;
  --padding-end: 18px;
  height: 46px;
  margin: 0;
  border-radius: 12px;
  font-weight: 700;
  box-shadow: 0 6px 14px rgba(124, 58, 237, 0.18);
  transition: transform 180ms ease, box-shadow 180ms ease;
}

.primary-add-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 9px 20px rgba(124, 58, 237, 0.24);
}

.primary-add-button ion-icon {
  margin-right: 4px;
  font-size: 1.1rem;
}

.primary-add-button span {
  display: inline-block;
  font-size: 0.82rem;
  font-weight: 750;
  letter-spacing: 0.02em;
}

.mobile-fab {
  display: none;
}

ion-fab-button {
  --background: #7c3aed;
  --background-activated: #6d28d9;
  --color: #ffffff;
  --box-shadow: 0 8px 20px rgba(124, 58, 237, 0.24);
}

@media (max-width: 1050px) and (min-width: 768px) {
  .dashboard-shell {
    padding-right: 8px;
    padding-left: 8px;
  }

  .summary-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .summary-grid :deep(.summary-card) {
    grid-column: 1 / -1;
  }

  .analytics-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 767px) {
  ion-content {
    --padding-start: 12px;
    --padding-end: 12px;
  }

  .header-brand {
    min-width: 0;
    padding-left: 12px;
  }

  .brand-copy small {
    display: none;
  }

  .brand-copy span {
    display: block;
    max-width: 142px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .header-user {
    max-width: 72px;
    margin-right: 2px;
    gap: 5px;
    font-size: 0.7rem;
  }

  .header-user span {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .user-avatar {
    width: 27px;
    height: 27px;
    font-size: 0.72rem;
  }

  .logout-button {
    margin-right: 4px;
    padding: 0 7px;
  }

  .logout-button span {
    margin-left: 4px;
    font-size: 0.7rem;
  }

  .dashboard-intro h1 {
    max-width: 100%;
    overflow-wrap: anywhere;
    font-size: clamp(1.55rem, 7vw, 2rem);
  }

  .dashboard-shell {
    padding-top: 16px;
  }

  .dashboard-intro,
  .section-heading {
    align-items: flex-start;
    flex-direction: column;
    gap: 12px;
  }

  .dashboard-intro .primary-add-button {
    display: flex;
    width: 100%;
  }

  .summary-grid,
  .analytics-grid {
    grid-template-columns: 1fr;
    gap: 0;
  }

  .summary-grid .stat-card {
    margin-top: 12px;
  }

  .analytics-grid {
    gap: 12px;
  }

  .transactions-section {
    padding: 16px;
  }

  .filter-toolbar {
    grid-template-columns: 1fr;
    gap: 8px;
  }

  .filter-toolbar ion-item,
  .filter-toolbar ion-searchbar {
    min-width: 0;
  }

  .mobile-fab {
    display: none;
    margin: 0 8px 14px 0;
  }
}

@media (min-width: 768px) {
  ion-content {
    --padding-start: 28px;
    --padding-end: 28px;
    --padding-top: 28px;
    --padding-bottom: 28px;
  }
}
</style>
