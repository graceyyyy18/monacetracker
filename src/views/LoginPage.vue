<template>
  <ion-page>
    <ion-content class="ion-padding auth-page">
      <div class="auth-shell">
        <div class="auth-card">
          <div class="brand-block">
            <div class="brand-mark">M</div>
            <div>
              <p class="brand-label">Monace Tracker</p>
              <p class="brand-subtitle">Your money, in control.</p>
            </div>
          </div>

          <h1>Welcome back</h1>
          <p class="auth-copy">Sign in to track every expense with clarity.</p>

          <ion-item>
            <ion-icon :icon="mailOutline" slot="start" aria-hidden="true" />
            <ion-input
              v-model="email"
              type="email"
              label="Email"
              label-placement="stacked"
              placeholder="you@example.com"
            />
          </ion-item>

          <ion-item>
            <ion-icon :icon="lockClosedOutline" slot="start" aria-hidden="true" />
            <ion-input
              v-model="password"
              type="password"
              label="Password"
              label-placement="stacked"
              placeholder="Enter your password"
            />
          </ion-item>

          <ion-button expand="block" class="auth-button" @click="login">
            <ion-icon :icon="logInOutline" slot="start" aria-hidden="true" />
            Sign in
          </ion-button>

          <p class="switch-text">
            Don’t have an account?
            <a href="#" @click.prevent="goToSignup">Sign up</a>
          </p>
        </div>

        <aside class="auth-visual" aria-label="Monace Tracker overview">
          <div class="visual-orbit orbit-one" />
          <div class="visual-orbit orbit-two" />
          <div class="visual-content">
            <p class="visual-eyebrow">Smarter spending</p>
            <h2>Take control of<br />your money.</h2>
            <p>Track your expenses, understand your spending habits, and make every peso count.</p>
            <div class="visual-points">
              <span><ion-icon :icon="trendingUpOutline" /> <b>Track Expenses</b><small>See where your money goes</small></span>
              <span><ion-icon :icon="pricetagOutline" /> <b>Organize Categories</b><small>Keep your spending in order</small></span>
              <span><ion-icon :icon="shieldCheckmarkOutline" /> <b>Build Better Habits</b><small>Make smarter financial decisions</small></span>
            </div>
          </div>
          <div class="visual-art" aria-hidden="true">
            <div class="wallet-art"><span>₱</span></div>
            <div class="chart-art"><i /><i /><i /><i /></div>
            <div class="coin coin-one">₱</div>
            <div class="coin coin-two">₱</div>
          </div>
        </aside>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { IonPage, IonContent, IonItem, IonInput, IonButton, IonIcon } from '@ionic/vue'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { auth } from '../firebase'
import { lockClosedOutline, logInOutline, mailOutline, pricetagOutline, shieldCheckmarkOutline, trendingUpOutline } from 'ionicons/icons'

const router = useRouter()
const email = ref('')
const password = ref('')

const goToSignup = () => {
  router.push('/signup')
}

const login = async () => {
  if (!email.value.trim() || !password.value.trim()) {
    alert('Please enter both email and password.')
    return
  }

  try {
    await signInWithEmailAndPassword(auth, email.value.trim(), password.value)
    router.push('/home')
  } catch (error: any) {
    console.error(error)
    alert(error?.message || 'Failed to login.')
  }
}
</script>

<style scoped>
.auth-page {
  --background: #f4f1ff;
}

.auth-shell {
  display: grid;
  width: min(100%, 1240px);
  min-height: min(680px, calc(100vh - 48px));
  margin: 24px auto;
  grid-template-columns: minmax(420px, 0.88fr) minmax(520px, 1.12fr);
  align-items: stretch;
  gap: 0;
  border-radius: 22px;
  box-shadow: 0 24px 60px rgba(79, 70, 229, 0.12);
}

.brand-block {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 40px;
}

.brand-mark {
  width: 42px;
  height: 42px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  background: #7c3aed;
  color: #fff;
  font-weight: 800;
  font-size: 22px;
  box-shadow: 0 8px 18px rgba(124, 58, 237, 0.22);
}

.brand-label {
  font-size: 0.78rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: #4f46e5;
  margin: 0;
}

.brand-subtitle {
  margin: 3px 0 0;
  color: #6b7280;
  font-size: 0.9rem;
}

.auth-card {
  width: 100%;
  box-sizing: border-box;
  background: #ffffff;
  border: 0;
  padding: clamp(32px, 5vw, 48px);
  border-radius: 22px 0 0 22px;
  box-shadow: none;
}

.auth-visual {
  position: relative;
  display: flex;
  min-height: 100%;
  overflow: hidden;
  align-items: flex-start;
  padding: clamp(40px, 5vw, 68px);
  border-radius: 0 22px 22px 0;
  background: linear-gradient(145deg, #6d28d9 0%, #4f46e5 58%, #8b5cf6 100%);
}

.visual-content {
  position: relative;
  z-index: 1;
  max-width: 430px;
  color: #ffffff;
}

.visual-eyebrow {
  margin: 0;
  color: #ede9fe;
  font-size: 0.75rem;
  font-weight: 800;
  letter-spacing: 0.2em;
  text-transform: uppercase;
}

.visual-content h2 {
  margin: 18px 0 16px;
  font-size: clamp(2.4rem, 5vw, 4rem);
  line-height: 1.08;
}

.visual-content > p:not(.eyebrow) {
  margin: 0;
  color: #ede9fe;
  line-height: 1.6;
}

.visual-points {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-top: 34px;
}

.visual-points span {
  display: grid;
  grid-template-columns: 34px 1fr;
  align-items: center;
  column-gap: 10px;
  color: #ffffff;
  font-size: 0.83rem;
}

.visual-points ion-icon {
  grid-row: span 2;
  display: grid;
  width: 34px;
  height: 34px;
  place-items: center;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  font-size: 1rem;
}

.visual-points small {
  color: #ddd6fe;
  font-size: 0.7rem;
}

.visual-orbit {
  position: absolute;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 50%;
}

.orbit-one {
  top: -120px;
  right: -100px;
  width: 430px;
  height: 430px;
}

.orbit-two {
  top: 40px;
  right: 90px;
  width: 230px;
  height: 230px;
}

.visual-art {
  position: absolute;
  right: 5%;
  bottom: 8%;
  width: 42%;
  height: 52%;
}

.wallet-art {
  position: absolute;
  right: 5%;
  bottom: 10%;
  display: grid;
  width: 190px;
  height: 135px;
  place-items: center;
  border-radius: 24px;
  background: linear-gradient(145deg, #7c3aed, #4c1d95);
  box-shadow: 18px 18px 30px rgba(30, 27, 75, 0.25);
  transform: rotate(8deg);
}

.wallet-art::before {
  position: absolute;
  right: -12px;
  top: 34px;
  width: 44px;
  height: 50px;
  border-radius: 10px;
  background: #a78bfa;
  content: '';
}

.wallet-art span {
  display: grid;
  width: 54px;
  height: 54px;
  place-items: center;
  border: 3px solid rgba(255, 255, 255, 0.6);
  border-radius: 50%;
  color: #ffffff;
  font-size: 1.8rem;
  font-weight: 800;
}

.chart-art {
  position: absolute;
  right: 30%;
  top: 5%;
  display: flex;
  height: 100px;
  align-items: flex-end;
  gap: 8px;
  padding: 14px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.92);
  transform: rotate(-6deg);
}

.chart-art i {
  display: block;
  width: 16px;
  border-radius: 5px 5px 0 0;
  background: #8b5cf6;
}

.chart-art i:nth-child(1) { height: 28px; }
.chart-art i:nth-child(2) { height: 46px; }
.chart-art i:nth-child(3) { height: 66px; }
.chart-art i:nth-child(4) { height: 84px; }

.coin {
  position: absolute;
  display: grid;
  width: 58px;
  height: 58px;
  place-items: center;
  border: 5px solid #fbbf24;
  border-radius: 50%;
  background: #f59e0b;
  color: #ffffff;
  font-size: 1.5rem;
  font-weight: 800;
  box-shadow: 4px 8px 14px rgba(30, 27, 75, 0.25);
}

.coin-one { right: 15%; bottom: 0; }
.coin-two { left: 10%; bottom: 20%; }

h1 {
  margin: 0 0 8px;
  font-size: clamp(2rem, 4vw, 2.5rem);
  color: #1e1b4b;
}

.auth-copy {
  margin: 0 0 20px;
  color: #6b7280;
}

.auth-card ion-item {
  --color: #1e1b4b;
  --highlight-color-focused: #7c3aed;
}

.auth-card ion-item ion-icon {
  color: #7c3aed;
  font-size: 1.1rem;
}

.auth-card ion-input {
  --color: #1e1b4b;
  --placeholder-color: #9ca3af;
}

.auth-button {
  margin-top: 20px;
  --background: #7c3aed;
  --background-hover: #6d28d9;
  --background-activated: #6d28d9;
  --color: white;
  font-weight: 700;
  height: 48px;
}

.switch-text {
  text-align: center;
  margin-top: 18px;
  font-size: 0.95rem;
  color: #6b7280;
}

.switch-text a {
  color: #7c3aed;
  text-decoration: none;
  font-weight: 700;
}

@media (max-width: 980px) {
  .auth-shell {
    width: min(100%, 520px);
    min-height: auto;
    margin: 16px auto;
    grid-template-columns: minmax(0, 1fr);
    justify-content: center;
    box-shadow: none;
  }

  .auth-card {
    border-radius: 22px;
  }

  .auth-visual {
    display: none;
  }
}
</style>
