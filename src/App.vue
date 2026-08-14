<script setup lang="ts">
import { ref } from "vue";
import { openConfirmDialog, openEditUserDialog } from "./dialogs";
import { cancelAllDialogs, PromiseDialogHost } from "./promise-dialog";

const status = ref("等待开始");
const timeline = ref<string[]>([]);
const running = ref(false);
const activeScenario = ref("serial");

function log(message: string) {
  timeline.value.push(message);
}

function beginScenario(name: string, initialStatus: string) {
  if (running.value) return false;
  running.value = true;
  activeScenario.value = name;
  status.value = initialStatus;
  timeline.value = [];
  return true;
}

async function startFlow() {
  if (!beginScenario("serial", "等待编辑")) return;

  try {
    log("1. 打开编辑弹窗");

    const edited = await openEditUserDialog(
      { userId: "U-1001", initialName: "马妍" },
      { key: "U-1001" },
    );

    if (edited.status === "cancelled") {
      status.value = "编辑已取消";
      log("流程在编辑阶段自然结束");
      return;
    }

    log(`2. 收到结果：${edited.value.name}`);
    status.value = "等待确认";

    const confirmed = await openConfirmDialog({
      title: "提交本次修改？",
      content: `用户「${edited.value.name}」已保存，是否继续提交审核？`,
    });

    if (confirmed.status === "cancelled") {
      status.value = "已保存，未提交";
      log("流程在确认阶段结束");
      return;
    }

    status.value = "流程完成";
    log("3. 已提交审核并刷新列表");
  } finally {
    running.value = false;
  }
}

async function startDedupeFlow() {
  if (!beginScenario("dedupe", "验证防重复")) return;

  try {
    log("1. 模拟同一用户被连续点击两次");
    const first = openEditUserDialog(
      { userId: "U-1001", initialName: "马妍" },
      { key: "U-1001" },
    );
    const second = openEditUserDialog(
      { userId: "U-1001", initialName: "马妍" },
      { key: "U-1001" },
    );

    log(`2. 两次调用复用同一个 Promise：${first === second ? "是" : "否"}`);
    const [a, b] = await Promise.all([first, second]);
    status.value = a.status === "confirmed" ? "只处理了一次" : "操作已取消";
    log(`3. 两个调用方收到相同结果：${a.status === b.status ? "是" : "否"}`);
  } finally {
    running.value = false;
  }
}

async function startAbortFlow() {
  if (!beginScenario("abort", "等待页面离开")) return;
  const controller = new AbortController();
  const timer = window.setTimeout(() => {
    log("2. 模拟路由切换，触发 AbortSignal");
    controller.abort({ type: "route-change" });
  }, 2500);

  try {
    log("1. 打开一个绑定页面生命周期的弹窗");
    const result = await openConfirmDialog(
      {
        title: "页面即将自动离开",
        content: "等待 2.5 秒观察弹窗自动关闭，或现在确认以提前完成。",
        confirmText: "留在当前页",
      },
      { signal: controller.signal },
    );
    window.clearTimeout(timer);
    status.value =
      result.status === "confirmed" ? "已留在当前页" : "已随页面清理";
    log(
      result.status === "confirmed"
        ? "2. 用户提前完成，取消自动清理"
        : "3. Promise 正常返回 cancelled",
    );
  } finally {
    window.clearTimeout(timer);
    running.value = false;
  }
}

async function startBatchFlow() {
  if (!beginScenario("batch", "批量审核中")) return;
  const records = ["设计稿 #128", "接口变更 #129", "上线申请 #130"];

  try {
    for (const [index, record] of records.entries()) {
      log(`${index + 1}. 等待审核 ${record}`);
      const result = await openConfirmDialog({
        title: `确认通过 ${record}？`,
        content: `当前进度 ${index + 1} / ${records.length}。取消会立即结束余下流程。`,
        confirmText: "通过并继续",
      });
      if (result.status === "cancelled") {
        status.value = `已在第 ${index + 1} 项停止`;
        log("批处理自然中断，后续弹窗不会打开");
        return;
      }
    }
    status.value = "批量审核完成";
    log("4. 全部记录处理完毕");
  } finally {
    running.value = false;
  }
}

async function startGlobalCleanupFlow() {
  if (!beginScenario("cleanup", "存在 3 个等待任务")) return;

  log("1. 同时创建 3 个独立弹窗任务");
  const pendingDialogs = ["编辑资料", "提交审核", "发布通知"].map(
    (task) =>
      openConfirmDialog({
        title: `${task}正在等待处理`,
        content: "这是一个尚未完成的全局任务。2.5 秒后将模拟退出登录并统一清理。",
        confirmText: "提前完成此项",
      }),
  );
  log("2. 三个 Promise 均处于 pending 状态");

  const timer = window.setTimeout(() => {
    log("3. 模拟退出登录，调用 cancelAllDialogs");
    cancelAllDialogs({ type: "logout" });
  }, 2500);

  try {
    const results = await Promise.all(pendingDialogs);
    const cancelledCount = results.filter(
      (result) => result.status === "cancelled",
    ).length;
    status.value = "全局清理完成";
    log(`4. ${cancelledCount} 个等待任务以 cancelled 收尾`);
  } finally {
    window.clearTimeout(timer);
    running.value = false;
  }
}

const scenarios = [
  {
    id: "serial",
    number: "01",
    title: "串行业务流",
    copy: "编辑 → 确认 → 刷新，结果沿着一段代码向下传递。",
    action: "开始体验",
    run: startFlow,
  },
  {
    id: "dedupe",
    number: "02",
    title: "防止重复打开",
    copy: "相同业务 key 复用进行中的 Promise，双击也只有一个弹窗。",
    action: "模拟双击",
    run: startDedupeFlow,
  },
  {
    id: "abort",
    number: "03",
    title: "随页面自动清理",
    copy: "绑定 AbortSignal，路由离开时弹窗和等待中的流程一起收尾。",
    action: "体验自动关闭",
    run: startAbortFlow,
  },
  {
    id: "batch",
    number: "04",
    title: "批量逐项确认",
    copy: "在循环里 await 每次选择；任意一步取消，后续流程自然停止。",
    action: "审核三条记录",
    run: startBatchFlow,
  },
  {
    id: "cleanup",
    number: "05",
    title: "全局统一清理",
    copy: "退出登录、权限失效或应用重置时，一次关闭所有弹窗，让每个等待任务安全结束。",
    action: "模拟退出登录",
    run: startGlobalCleanupFlow,
  },
];
</script>

<template>
  <main class="page-shell">
    <section class="hero">
      <div>
        <span class="hero-kicker">Vue</span>
        <h1>让弹窗像请求一样<br />可以被 <em>await</em></h1>
        <p>
          告别散落的
          visible、回调和中间状态，用一段从上到下的代码描述完整业务流程。
        </p>
        <div class="actions">
          <button
            class="button primary large"
            :disabled="running"
            @click="startFlow"
          >
            {{ running ? "流程进行中" : "体验串行弹窗" }}
          </button>
        </div>
      </div>

      <aside class="code-card">
        <div class="code-dots"><i /><i /><i /></div>
        <pre><span>const</span> edited = <b>await</b> openEditUserDialog({ id })

<span>if</span> (edited.status === <i>'confirmed'</i>) {
  <b>await</b> openConfirmDialog({
    content: edited.value.name
  })
  <b>await</b> refreshList()
}</pre>
      </aside>
    </section>

    <section class="flow-panel">
      <div class="status-block">
        <span>当前状态</span>
        <strong>{{ status }}</strong>
      </div>
      <ol class="timeline">
        <li v-if="timeline.length === 0" class="empty">
          点击按钮观察 Promise 流程
        </li>
        <li v-for="item in timeline" :key="item">{{ item }}</li>
      </ol>
    </section>

    <section class="scenario-section">
      <div class="section-heading">
        <div>
          <span class="hero-kicker">更多场景</span>
          <h2>不只是确认框</h2>
        </div>
        <p>
          选择一个例子，观察弹窗的结果、去重和生命周期如何回到普通的异步代码里。
        </p>
      </div>

      <div class="scenario-grid">
        <article
          v-for="scenario in scenarios"
          :key="scenario.id"
          class="scenario-card"
          :class="{ active: activeScenario === scenario.id }"
        >
          <span class="scenario-number">{{ scenario.number }}</span>
          <h3>{{ scenario.title }}</h3>
          <p>{{ scenario.copy }}</p>
          <button class="text-button" :disabled="running" @click="scenario.run">
            {{
              running && activeScenario === scenario.id
                ? "进行中…"
                : scenario.action
            }}
            <span aria-hidden="true">→</span>
          </button>
        </article>
      </div>
    </section>
  </main>

  <PromiseDialogHost />
</template>
