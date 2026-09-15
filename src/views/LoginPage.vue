<template>
  <ion-page>
    <ion-content class="ion-padding auth-page">
      <div class="auth-card">
        <h1>Welcome back</h1>
        <p>Sign in to manage your expenses.</p>

        <ion-item>
          <ion-input
            v-model="email"
            type="email"
            label="Email"
            label-placement="stacked"
            placeholder="you@example.com"
          />
        </ion-item>

        <ion-item>
          <ion-input
            v-model="password"
            type="password"
            label="Password"
            label-placement="stacked"
            placeholder="Enter your password"
          />
        </ion-item>

        <ion-button expand="block" class="auth-button" @click="login">
          Login
        </ion-button>

        <p class="switch-text">
          Don’t have an account?
          <a href="#" @click.prevent="goToSignup">Sign up</a>
        </p>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { IonPage, IonContent, IonItem, IonInput, IonButton } from '@ionic/vue'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { auth } from '../firebase'

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
  display: flex;
  align-items: center;
  justify-content: center;
  --background: #f5f7fb;
}

.auth-card {
  width: min(100%, 420px);
  background: white;
  padding: 24px;
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
}

h1 {
  margin: 0 0 8px;
  font-size: 28px;
}

p {
  margin: 0 0 20px;
  color: #666;
}

.auth-button {
  margin-top: 20px;
}

.switch-text {
  text-align: center;
  margin-top: 18px;
  font-size: 14px;
}

.switch-text a {
  color: #2563eb;
  text-decoration: none;
  font-weight: 600;
}
</style>
