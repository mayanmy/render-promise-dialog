<script setup lang="ts">
import { ref } from "vue";
import { openConfirmDialog, openEditUserDialog } from "./dialogs";
import { cancelAllDialogs, PromiseDialogHost } from "./promise-dialog";

const status = ref("等待开始");
const timeline = ref<string[]>([]);
const running = ref(false);

function log(message: string) {
  timeline.value.push(message);
}

async function startFlow() {
  if (running.value) return;
  running.value = true;
  timeline.value = [];

  try {
    status.value = "等待编辑";
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
</script>

<template>
  <main class="page-shell">
    <section class="hero">
      <div>
        <span class="hero-kicker">Vue 3</span>
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
          <button
            class="button ghost large"
            @click="cancelAllDialogs({ type: 'manual' })"
          >
            关闭全部
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
  </main>

  <PromiseDialogHost />
</template>
