<template>
    <n-layout has-sider position="absolute">
        <n-layout-sider class="left-sidebar">
            <!-- logo部分 -->
            <div class="logo">
                <n-gradient-text type="info">
                    <h1>ZAdmin</h1>
                </n-gradient-text>
                
            </div>
            <!-- logo部分END -->

            <!-- 菜单部分 -->
            <div class="menu">
                <n-menu
                    :theme-overrides="menuThemeOverrides"
                    :options="menuOptions"
                    v-model:value="selectedKey"
                    @update:value="handleMenuUpdate"
                />
            </div>
            <!-- 菜单部分END -->
        </n-layout-sider>
        <n-layout>
            <n-layout-header class="dashboard-header">
                <div class="left-header">

                </div>
                <div class="right-header">
                    <!-- 右侧头像 -->
                    <n-dropdown :options="userOptions" @select="handleSelect">
                        <n-avatar
                            round
                            size="medium"
                            src="https://www.gravatar.com/avatar/a0cb2964dccb9e5f7bd520b021edc6ce?s=32"
                            />
                    </n-dropdown>
                    <!-- 右侧头像END -->
                </div>
            </n-layout-header>
            <n-layout-content class="dashboard-content">
                <n-tabs
                    v-model:value="activeTab"
                    type="card"
                    @close="handleTabClose"
                    @update:value="handleTabChange"
                    size="small"
                >
                    <n-tab-pane
                        v-for="tab in openTabs"
                        :key="tab.key"
                        :name="tab.key"
                        :tab="tab.label"
                        :closable="tab.key !== 'Home'"
                    >
                        <component :is="menus[tab.key]" />
                    </n-tab-pane>
                </n-tabs>
            </n-layout-content>
            
        </n-layout>
    </n-layout>
</template>

<script lang="ts" setup>
import type { Component } from 'vue'
import {ref,onMounted,watch, defineAsyncComponent} from 'vue'
import { NIcon, NTabs, NTabPane } from 'naive-ui'
import type { MenuProps } from 'naive-ui'   // 修改：导入类型而不是 menuProps
type MenuThemeOverrides = NonNullable<MenuProps['themeOverrides']>
import Password from '@/components/dashboard/password.vue'
import { h } from 'vue'
import { useRouter,useRoute } from 'vue-router'
import {
  HomeSharp,
  Settings,
  PeopleSharp,
  LogOutSharp,
  Pencil,
  InformationCircleOutline
} from '@vicons/ionicons5'

const router = useRouter()
const route = useRoute()

// 异步加载组件
const Home = defineAsyncComponent(() => import('@/components/dashboard/home.vue'))
const Setting = defineAsyncComponent(() => import('@/components/dashboard/setting.vue'))


// 菜单配置（key 与路由参数和值对应）
const menuOptions = [
  {
    label: '首页',
    key: 'Home',
    icon: renderIcon(HomeSharp)
  },
  {
    label: '设置',
    key: 'Setting',
    icon: renderIcon(Settings)
  },
  // 虽然修改密码不在侧边栏显示，但为了让 tab 逻辑正常工作，需要在这里注册
  {
    label: '修改密码',
    key: 'Password',
    show: false // 使用 show: false 来隐藏它
  }
]

// 标签页管理
interface Tab {
  key: string
  label: string
}
const openTabs = ref<Tab[]>([])
const activeTab = ref<string | undefined>(undefined)

// 选中的菜单（用于高亮）
const selectedKey = ref<string | null>(null)

// 已注册的可渲染组件
const menus: Record<string, Component> = {
  Home,
  Setting,
  Password
  // 将来添加: UserManagement
}

// 打开或激活与路由匹配的标签页
const openTabFromRoute = (name: string | undefined) => {
  if (!name) return
  const menu = menuOptions.find((m) => m.key === name)
  if (!menu || !menus[name]) {
    router.replace('/dashboard/Home')
    return
  }

  const tabExists = openTabs.value.some((tab) => tab.key === name)
  if (!tabExists) {
    openTabs.value.push({ key: menu.key, label: menu.label })
  }
  activeTab.value = name
  selectedKey.value = name
}

// 用户点击头像后的操作
function handleSelect(key: string | number) {
    console.log('handleSelect key:', key)
    // 调用handleMenuUpdate
    switch(key) {
        case 'info':
            // 个人资料
            console.log('个人资料')
            break
        case 'change_password':
            router.push('/dashboard/Password')
            break
        case 'logout':
            // 退出登录
            console.log('退出登录')
            break
    }
}

// 初始化：根据路由参数设置
onMounted(() => {
  // 确保 Home tab 始终存在且在第一位
  const homeMenu = menuOptions.find(m => m.key === 'Home')
  if (homeMenu && !openTabs.value.some(t => t.key === 'Home')) {
      openTabs.value.unshift({ key: homeMenu.key, label: homeMenu.label })
  }
  
  const initialName = route.params.name as string | undefined
  // 如果初始路由有效，则打开对应 tab，否则导航到 Home
  if (initialName && menuOptions.some(m => m.key === initialName)) {
      openTabFromRoute(initialName)
  } else {
      router.replace('/dashboard/Home')
  }
})

// 监听路由变化（手动刷新 / 浏览器前进后退 / 代码导航）
watch(
  () => route.params.name,
  (newName) => {
    openTabFromRoute(newName as string | undefined)
  }
)

// 点击菜单时，通过路由导航
function handleMenuUpdate(key: string) {
  if (key !== route.params.name) {
    router.push(`/dashboard/${key}`)
  }
}

// 关闭标签页
function handleTabClose(key: string) {
  const index = openTabs.value.findIndex((tab) => tab.key === key)
  if (index === -1) return

  openTabs.value.splice(index, 1)

  // 如果关闭的是当前激活的tab，则需要导航到新的tab
  if (activeTab.value === key) {
    let nextTabKey: string | undefined = undefined
    // 如果后面还有tab，则激活下一个tab
    if (index < openTabs.value.length) {
      nextTabKey = openTabs.value[index].key
    } 
    // 如果是最后一个tab，则激活前一个tab
    else if (index > 0) {
      nextTabKey = openTabs.value[index - 1].key
    } else {
      // 如果没有其他 tab 了，回退到 Home
      nextTabKey = 'Home'
    }
    
    if (nextTabKey && nextTabKey !== route.params.name) {
        router.push(`/dashboard/${nextTabKey}`)
    }
  }
}

// 切换标签页时，通过路由导航
function handleTabChange(key: string) {
    if (key !== route.params.name) {
        router.push(`/dashboard/${key}`)
    }
}

// 显示菜单图标
function renderIcon(icon: Component) {
  return () => h(NIcon, null, { default: () => h(icon) })
}

// 菜单样式定制，参考：https://www.naiveui.com/zh-CN/light/docs/customize-theme
const menuThemeOverrides: MenuThemeOverrides = {
    itemTextColor:'#c0c4cc',
    itemIconColor:'#c0c4cc',
    itemColorHover:'#ffffff',
}

// 这里显示用户头像菜单列表
const userOptions = [
    {
        label: '个人资料',
        key: 'info',
        icon: renderIcon(InformationCircleOutline),
    },
    {
        label: '修改密码',
        key: 'change_password',
        icon: renderIcon(Pencil),
    },
    {
        label: '退出登录',
        key: 'logout',
        icon: renderIcon(LogOutSharp)
    }
]


</script>

<style scoped>
:deep(.n-layout){
    position: static !important;
}
.left-sidebar{
    height: 100vh;
    background-color: #263445;
    color:#ffffff;
    /* padding:24px; */
}

.dashboard-footer{
    position: sticky;
    bottom: 0;
    width: 100%;
    background-color: #f0f2f5;
}
.dashboard-content{
    /* background-color: yellow; */
    /* margin: 16px 0; */
    padding:10px 0px 10px 16px;
    height: calc(100vh - 64px);
}
.logo{
    display: flex;
    justify-content: center;
    align-items: center;
    height: 64px !important;
    cursor: pointer;
    /* background-color: #1a2332; */
    /* 底部阴影特效 */
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.15);
    /* border-bottom: 1px solid rgba(255, 255, 255, 0.2); */
}

:deep(.n-tabs .n-tabs-nav){
    position: sticky;
    top:0;
    background-color: #ffffff;
}

/* :deep(.n-tabs .n-tab-pane){
    margin-top:100px;
} */
.logo h1{
    font-weight: 800;
    font-size:26px;
}

.dashboard-header{
    height: 64px !important;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 24px 8px 24px;
    position:sticky;
    top:0;
    right:0;
    height: 60px;
    /* 添加底部轻微阴影特效 */
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
    
}
.dashboard-footer{
    text-align: center;
    padding: 16px 0;
    font-size: 14px;
    color: rgba(0, 0, 0, 0.45);
}
</style>