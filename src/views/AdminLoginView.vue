<template>
  <div class="admin-login">
    <div class="title">
      <n-gradient-text type="info">
        <h2>管理员登录</h2>
      </n-gradient-text>
    </div>
    <n-card class="login-card">
      <!-- 登录表单 -->
      <n-form style="margin-top:28px;">
        <n-form-item label="用户名">
          <n-input placeholder="请输入用户名" />
        </n-form-item>

        <n-form-item label="密码">
          <n-input type="password" placeholder="请输入密码" />
        </n-form-item>

        <n-form-item>
          <n-button style="width: 100%;" type="primary" @click="login">登录</n-button>
        </n-form-item>
      </n-form>
      <!-- 登录表单END -->
    </n-card>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { createDiscreteApi } from 'naive-ui'

const router = useRouter()
const { message } = createDiscreteApi([
  'message'
])
const login = () => {
  message.success('登录成功')
  // 延迟2s后台跳转
  setTimeout(() => {
    router.push('/dashboard/Home')
  }, 2000)
}
</script>

<style scoped>
.admin-login{
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #f0f2f5;
  flex-direction: column;
}
.login-card{
  width: 400px;
  /* padding: 20px; */
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  background-color: #ffffff;
}
.title{
  margin-bottom: 12px;
}
.n-gradient-text{
  font-size: 18px;
}
</style>