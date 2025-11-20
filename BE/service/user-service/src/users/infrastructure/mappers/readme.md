### Luồng tổng quát xử lý dữ liệu User

<pre class="overflow-visible!" data-start="177" data-end="1135"><div class="contain-inline-size rounded-2xl relative bg-token-sidebar-surface-primary"><div class="sticky top-9"><div class="absolute end-0 bottom-0 flex h-9 items-center pe-2"><div class="bg-token-bg-elevated-secondary text-token-text-secondary flex items-center gap-4 rounded-sm px-2 font-sans text-xs"></div></div></div><div class="overflow-y-auto p-4" dir="ltr"><code class="whitespace-pre! language-text"><span><span>      +-------------------------+
      |   MongoDB (Schema)      |
      |   Document/Collection   |
      +----------+--------------+
                 |
                 | Query / find
                 v
      +----------------------+
      |     Document         |
      |  (Schema object)     |
      +----------+-----------+
                 |
                 | toEntity()
                 v
      +----------------------+
      |       Entity         |
      | (Domain Object)      |
      | - business methods   |
      +----------+-----------+
                 |
                 | Modify / process
                 v
      +----------------------+
      |       Entity         |
      |  (Updated Domain)    |
      +----------+-----------+
                 |
                 | toPersistence() → map to schema
                 v
      +----------------------+
      |   MongoDB (Schema)   |
      |   Document/Collection|
      +----------------------+
</span></span></code></div></div></pre>
