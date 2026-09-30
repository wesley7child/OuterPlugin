# GitHub Actions 自动同步说明

本项目包含两个GitHub Actions工作流，用于自动同步上游代码并构建项目。

## 📋 工作流说明

### 1. 自动同步工作流 (`sync-upstream.yml`)

**触发条件：**
- 每天UTC时间00:00自动运行（北京时间08:00）
- 手动触发
- 当工作流文件本身被修改时

**功能：**
- 自动检查上游仓库 `qianjiachun/douyuEx` 是否有更新
- 如有更新，自动合并到当前仓库
- 运行 `npm run build` 构建项目
- 将生成的 `dist` 目录重命名为 `build-output` 避免与上游冲突
- 自动提交并推送更改
- 上传构建产物到GitHub Actions Artifacts

### 2. 手动同步工作流 (`manual-sync.yml`)

**触发条件：**
- 仅支持手动触发

**可配置选项：**
- `force_sync`: 强制同步（即使没有检测到更改）
- `custom_dist_name`: 自定义构建目录名称（默认为 `build-output`）

## 🚀 使用方法

### 自动同步
自动同步会每天运行，无需手动干预。你也可以在GitHub仓库的Actions页面手动触发。

### 手动同步
1. 访问你的GitHub仓库
2. 点击 "Actions" 标签页
3. 选择 "Manual Sync and Build" 工作流
4. 点击 "Run workflow" 按钮
5. 根据需要配置选项：
   - 勾选 "强制同步" 如果想要强制执行同步
   - 修改 "自定义构建目录名称" 如果需要不同的目录名
6. 点击绿色的 "Run workflow" 按钮

## 📁 构建产物

构建完成后，会生成以下文件：
- `douyuex.js` - 未压缩版本
- `douyuex.user.js` - 压缩版本（用于油猴脚本）
- `douyuex_version.txt` - 版本信息

这些文件会保存在重命名后的目录中（默认为 `build-output`），同时也会作为Artifacts上传到GitHub Actions，可以在Actions页面下载。

## ⚙️ 配置说明

### 权限要求
工作流需要以下权限：
- `contents: write` - 用于推送代码更改
- `actions: read` - 用于读取工作流状态

### 环境要求
- Node.js 18
- npm

### 上游仓库
当前配置的上游仓库为：`https://github.com/qianjiachun/douyuEx.git`

如需修改上游仓库地址，请编辑工作流文件中的相应行：
```yaml
git remote add upstream https://github.com/qianjiachun/douyuEx.git || true
```

## 🔧 自定义配置

### 修改同步频率
编辑 `sync-upstream.yml` 文件中的 cron 表达式：
```yaml
schedule:
  - cron: '0 0 * * *'  # 每天00:00 UTC
```

### 修改构建目录名称
默认情况下，`dist` 目录会被重命名为 `build-output`。你可以：

1. 在手动同步中使用自定义名称
2. 修改自动同步工作流中的重命名逻辑：
```bash
mv dist your-custom-name
```

## ❗ 注意事项

1. **合并冲突处理**：如果检测到合并冲突，工作流会使用 `git reset --hard upstream/master` 强制同步，这会丢弃本地的修改。
2. **构建失败**：如果构建失败，工作流会停止执行并报告错误。
3. **权限问题**：确保GitHub Actions有足够的权限来推送到仓库。
4. **依赖安装**：工作流会自动安装npm依赖，确保 `package.json` 文件正确配置。

## 📊 监控和日志

- 在GitHub仓库的Actions页面可以查看所有工作流运行记录
- 每次运行都会显示详细的日志信息
- 构建产物会作为Artifacts保存30天
- 工作流会在执行摘要中显示同步状态和构建信息
