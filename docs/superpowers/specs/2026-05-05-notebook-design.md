# 笔记项目技术设计

## 概述

基于 Java (Spring Boot) + Vue 3 的笔记应用，参考钉钉文档的所见即所得编辑体验，深度支持Markdown语法。

## 使用场景

混合模式：个人笔记为主，支持简单链接分享（只读查看）。

## 技术栈

| 层 | 选型 |
|---|---|
| 编辑器 | Tiptap (ProseMirror) + @tiptap/vue-3 |
| 前端框架 | Vue 3 + Composition API + TypeScript + Vite |
| 状态管理 | Pinia |
| UI组件 | Element Plus |
| 后端 | Spring Boot 3 + MyBatis-Plus |
| 数据库 | MySQL 8 |
| 接口 | RESTful JSON |

## 数据库

```sql
CREATE TABLE folders (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    parent_id BIGINT DEFAULT NULL,
    name VARCHAR(255) NOT NULL,
    sort_order INT DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (parent_id) REFERENCES folders(id) ON DELETE CASCADE
);

CREATE TABLE notes (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    folder_id BIGINT NOT NULL,
    title VARCHAR(500) NOT NULL DEFAULT '无标题',
    content LONGTEXT COMMENT 'Tiptap HTML',
    content_json LONGTEXT COMMENT 'Tiptap JSON结构化数据',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (folder_id) REFERENCES folders(id) ON DELETE CASCADE
);

CREATE TABLE share_links (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    note_id BIGINT NOT NULL,
    token VARCHAR(64) NOT NULL UNIQUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (note_id) REFERENCES notes(id) ON DELETE CASCADE
);
```

## API

```
# 目录
GET    /api/folders              # 目录树（嵌套结构）
POST   /api/folders              # 新建目录 {name, parentId?}
PUT    /api/folders/{id}         # 更新 {name, parentId?, sortOrder?}
DELETE /api/folders/{id}         # 删除（级联删除子目录和笔记）

# 笔记
GET    /api/notes?folderId=      # 按目录列出笔记（仅标题 + 时间）
GET    /api/notes/{id}           # 获取笔记完整内容
POST   /api/notes                # 创建笔记 {folderId, title?, content?, contentJson?}
PUT    /api/notes/{id}           # 更新笔记 {title?, content?, contentJson?}
DELETE /api/notes/{id}           # 删除笔记

# 分享
POST   /api/notes/{id}/share     # 生成分享链接，返回 {token, url}
GET    /api/share/{token}        # 查看分享笔记（只读，返回 title + content）
```

## 前端路由

| 路径 | 页面 | 说明 |
|---|---|---|
| `/` | 重定向 | 跳转到第一个笔记或空状态引导 |
| `/folder/{folderId}` | FolderView | 目录内容列表 |
| `/note/{noteId}` | NoteView | 编辑器主界面 |
| `/share/{token}` | ShareView | 只读分享页（无侧边栏） |

## 前端组件树

```
App.vue
├── layout/AppLayout.vue       # 主布局：侧边栏 + 内容区
│   ├── Sidebar.vue            # 左侧栏：目录树 + 新建按钮
│   └── NoteView.vue           # 主内容：编辑器
│       ├── EditorToolbar.vue  # Tiptap工具栏
│       └── NoteEditor.vue     # Tiptap编辑器核心
├── FolderView.vue             # 目录详情页
└── ShareView.vue              # 分享只读页
```

## Tiptap配置

- 扩展列表：StarterKit, Placeholder, Image, Table, Link, Highlight, TaskList, Typography
- 内置Markdown输入规则（StarterKit自动支持"# "→h1, "* "→ul, "1. "→ol, "```"→code block等）
- 存储策略：同时存储content（HTML用于渲染）和contentJson（Tiptap JSON用于回填编辑器）
- 自动保存：防抖2秒，检测isDirty标记避免无变更请求

## 项目结构

```
notebook/
├── web/                           # Vue 3 前端
│   ├── src/
│   │   ├── api/                   # axios实例 + 按模块封装
│   │   ├── components/
│   │   │   ├── Sidebar.vue
│   │   │   ├── EditorToolbar.vue
│   │   │   └── NoteEditor.vue
│   │   ├── views/
│   │   │   ├── NoteView.vue
│   │   │   ├── FolderView.vue
│   │   │   └── ShareView.vue
│   │   ├── stores/
│   │   │   ├── folder.ts
│   │   │   └── note.ts
│   │   ├── router/index.ts
│   │   ├── styles/
│   │   ├── App.vue
│   │   └── main.ts
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
└── server/                        # Spring Boot 后端
    ├── src/main/java/com/notebook/
    │   ├── NotebookApplication.java
    │   ├── controller/
    │   │   ├── FolderController.java
    │   │   ├── NoteController.java
    │   │   └── ShareController.java
    │   ├── service/
    │   │   ├── FolderService.java
    │   │   ├── NoteService.java
    │   │   └── ShareService.java
    │   ├── mapper/
    │   │   ├── FolderMapper.java
    │   │   ├── NoteMapper.java
    │   │   └── ShareLinkMapper.java
    │   ├── entity/
    │   │   ├── Folder.java
    │   │   ├── Note.java
    │   │   └── ShareLink.java
    │   ├── dto/
    │   │   ├── FolderDto.java
    │   │   ├── NoteDto.java
    │   │   └── ShareResult.java
    │   └── config/
    │       ├── MybatisPlusConfig.java
    │       └── CorsConfig.java
    ├── src/main/resources/
    │   ├── application.yml
    │   └── db/schema.sql
    └── pom.xml
```

## 后续扩展点（不在本期范围）

- 用户系统（注册/登录/OAuth）
- 分享权限（密码/有效期）
- 标签系统
- 笔记历史版本
- 全文搜索
