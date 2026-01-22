/**
 * 领域同义词映射
 * 
 * 用于匹配用户表达方式与技能领域
 * 支持多语言关键词：英文、中文、日语、韩语、法语、德语、西班牙语
 */

/**
 * 领域同义词映射表
 */
export const DOMAIN_SYNONYMS: Record<string, string[]> = {
  // ============================================
  // 文档处理
  // ============================================
  pdf: [
    // 英文
    'pdf', 'document', 'acrobat', 'portable document',
    // 中文
    '文档', 'PDF文件',
    // 日语
    'ドキュメント', 'PDF文書', '書類',
    // 韩语
    '문서', 'PDF파일',
    // 法语
    'fichier pdf', 'document pdf',
    // 德语
    'dokument', 'pdf-datei',
    // 西班牙语
    'documento', 'archivo pdf',
  ],
  
  excel: [
    // 英文
    'excel', 'xlsx', 'xls', 'spreadsheet', 'workbook',
    // 中文
    '表格', '电子表格', 'Excel文件',
    // 日语
    'スプレッドシート', '表計算', 'エクセル',
    // 韩语
    '스프레드시트', '엑셀', '표',
    // 法语
    'tableur', 'feuille de calcul',
    // 德语
    'tabelle', 'tabellenkalkulation',
    // 西班牙语
    'hoja de cálculo', 'planilla',
  ],
  
  word: [
    // 英文
    'word', 'docx', 'doc', 'document',
    // 中文
    '文档', 'Word文件',
    // 日语
    'ワード', '文書',
    // 韩语
    '워드', '문서',
    // 法语
    'document word',
    // 德语
    'word-dokument',
    // 西班牙语
    'documento word',
  ],
  
  markdown: [
    // 英文
    'markdown', 'md', 'markup',
    // 中文
    '标记', 'Markdown文件',
    // 日语
    'マークダウン',
    // 韩语
    '마크다운',
  ],
  
  // ============================================
  // 图像处理
  // ============================================
  image: [
    // 英文
    'image', 'picture', 'photo', 'png', 'jpg', 'jpeg', 'gif', 'webp',
    // 中文
    '图片', '图像', '照片',
    // 日语
    '画像', 'イメージ', '写真',
    // 韩语
    '이미지', '사진', '그림',
    // 法语
    'image', 'photo', 'illustration',
    // 德语
    'bild', 'foto', 'grafik',
    // 西班牙语
    'imagen', 'foto', 'fotografía',
  ],
  
  screenshot: [
    // 英文
    'screenshot', 'capture', 'screen capture',
    // 中文
    '截图', '截屏', '屏幕截图',
    // 日语
    'スクリーンショット', '画面キャプチャ',
    // 韩语
    '스크린샷', '화면 캡처',
    // 法语
    'capture d\'écran',
    // 德语
    'bildschirmfoto',
    // 西班牙语
    'captura de pantalla',
  ],
  
  // ============================================
  // 代码相关
  // ============================================
  code: [
    // 英文
    'code', 'coding', 'programming', 'script', 'source code',
    // 中文
    '代码', '编程', '程序', '源代码',
    // 日语
    'コード', 'プログラミング', 'ソースコード',
    // 韩语
    '코드', '프로그래밍', '소스코드',
    // 法语
    'code', 'programmation', 'code source',
    // 德语
    'code', 'programmierung', 'quellcode',
    // 西班牙语
    'código', 'programación', 'código fuente',
  ],
  
  refactor: [
    // 英文
    'refactor', 'restructure', 'reorganize', 'refactoring',
    // 中文
    '重构', '重组', '优化代码',
    // 日语
    'リファクタリング', '再構築',
    // 韩语
    '리팩토링', '재구성',
    // 法语
    'refactorisation', 'restructuration',
    // 德语
    'refaktorisierung', 'umstrukturierung',
    // 西班牙语
    'refactorización', 'reestructuración',
  ],
  
  test: [
    // 英文
    'test', 'testing', 'unit test', 'spec', 'test case',
    // 中文
    '测试', '单元测试', '测试用例',
    // 日语
    'テスト', 'ユニットテスト', 'テストケース',
    // 韩语
    '테스트', '단위 테스트', '테스트 케이스',
    // 法语
    'test', 'test unitaire', 'cas de test',
    // 德语
    'test', 'einheitentest', 'testfall',
    // 西班牙语
    'prueba', 'prueba unitaria', 'caso de prueba',
  ],
  
  debug: [
    // 英文
    'debug', 'troubleshoot', 'fix bug', 'debugging',
    // 中文
    '调试', '排错', '修复bug', '除错',
    // 日语
    'デバッグ', 'バグ修正', 'トラブルシューティング',
    // 韩语
    '디버그', '디버깅', '버그 수정',
    // 法语
    'débogage', 'dépannage', 'correction de bug',
    // 德语
    'debuggen', 'fehlersuche', 'fehlerbehebung',
    // 西班牙语
    'depuración', 'corrección de errores',
  ],
  
  // ============================================
  // 版本控制
  // ============================================
  git: [
    // 英文
    'git', 'commit', 'repository', 'branch', 'merge', 'pull request', 'pr',
    // 中文
    '提交', '仓库', '分支', '合并', '版本控制',
    // 日语
    'コミット', 'リポジトリ', 'ブランチ', 'マージ',
    // 韩语
    '커밋', '저장소', '브랜치', '병합',
    // 法语
    'dépôt', 'branche', 'fusion',
    // 德语
    'repository', 'zweig', 'zusammenführen',
    // 西班牙语
    'repositorio', 'rama', 'fusionar',
  ],
  
  github: [
    // 英文
    'github', 'gh', 'issue', 'pull request',
    // 中文
    '问题', '拉取请求',
    // 日语
    'イシュー', 'プルリクエスト',
    // 韩语
    '이슈', '풀 리퀘스트',
  ],
  
  // ============================================
  // 容器化
  // ============================================
  docker: [
    // 英文
    'docker', 'container', 'dockerfile', 'compose', 'image',
    // 中文
    '容器', 'Docker镜像', '容器化',
    // 日语
    'コンテナ', 'ドッカー', 'コンテナ化',
    // 韩语
    '컨테이너', '도커', '컨테이너화',
    // 法语
    'conteneur', 'conteneurisation',
    // 德语
    'container', 'containerisierung',
    // 西班牙语
    'contenedor', 'contenedorización',
  ],
  
  kubernetes: [
    // 英文
    'kubernetes', 'k8s', 'kubectl', 'pod', 'deployment', 'service',
    // 中文
    '集群', '部署', '服务',
    // 日语
    'クラスター', 'デプロイメント',
    // 韩语
    '클러스터', '배포',
  ],
  
  // ============================================
  // 数据库
  // ============================================
  database: [
    // 英文
    'database', 'db', 'sql', 'query',
    // 中文
    '数据库', '查询', '数据存储',
    // 日语
    'データベース', 'クエリ',
    // 韩语
    '데이터베이스', '쿼리',
    // 法语
    'base de données', 'requête',
    // 德语
    'datenbank', 'abfrage',
    // 西班牙语
    'base de datos', 'consulta',
  ],
  
  mysql: [
    'mysql', 'mariadb',
  ],
  
  postgres: [
    'postgres', 'postgresql', 'pg',
  ],
  
  mongodb: [
    'mongodb', 'mongo', 'nosql',
  ],
  
  redis: [
    // 英文
    'redis', 'cache',
    // 中文
    '缓存', '内存数据库',
    // 日语
    'キャッシュ',
    // 韩语
    '캐시',
    // 法语
    'cache', 'mémoire cache',
    // 德语
    'cache', 'zwischenspeicher',
    // 西班牙语
    'caché', 'memoria caché',
  ],
  
  // ============================================
  // API 相关
  // ============================================
  api: [
    // 英文
    'api', 'rest', 'restful', 'endpoint', 'graphql',
    // 中文
    '接口', 'API接口', '端点',
    // 日语
    'エンドポイント', 'インターフェース',
    // 韩语
    '엔드포인트', '인터페이스',
    // 法语
    'interface', 'point de terminaison',
    // 德语
    'schnittstelle', 'endpunkt',
    // 西班牙语
    'interfaz', 'punto final',
  ],
  
  http: [
    // 英文
    'http', 'request', 'fetch', 'axios', 'curl',
    // 中文
    '请求', 'HTTP请求', '网络请求',
    // 日语
    'リクエスト', 'HTTPリクエスト',
    // 韩语
    '요청', 'HTTP 요청',
    // 法语
    'requête', 'requête http',
    // 德语
    'anfrage', 'http-anfrage',
    // 西班牙语
    'solicitud', 'petición http',
  ],
  
  // ============================================
  // 前端框架
  // ============================================
  react: [
    // 英文
    'react', 'reactjs', 'jsx', 'tsx', 'component',
    // 中文
    '组件', 'React组件',
    // 日语
    'コンポーネント', 'リアクト',
    // 韩语
    '컴포넌트', '리액트',
  ],
  
  vue: [
    'vue', 'vuejs', 'vuex', 'pinia',
  ],
  
  angular: [
    'angular', 'ng',
  ],
  
  // ============================================
  // 后端框架
  // ============================================
  node: [
    'node', 'nodejs', 'npm', 'express', 'koa', 'nest',
  ],
  
  python: [
    'python', 'py', 'pip', 'django', 'flask', 'fastapi',
  ],
  
  java: [
    'java', 'spring', 'maven', 'gradle',
  ],
  
  // ============================================
  // 数据处理
  // ============================================
  json: [
    // 英文
    'json', 'parse', 'stringify',
    // 中文
    '解析', 'JSON解析', 'JSON数据',
    // 日语
    'パース', 'JSON解析',
    // 韩语
    '파싱', 'JSON 파싱',
  ],
  
  xml: [
    'xml', 'xpath',
  ],
  
  csv: [
    // 英文
    'csv', 'tsv',
    // 中文
    '逗号分隔', 'CSV文件',
    // 日语
    'CSVファイル',
    // 韩语
    'CSV 파일',
  ],
  
  yaml: [
    'yaml', 'yml',
  ],
  
  // ============================================
  // 文件操作
  // ============================================
  file: [
    // 英文
    'file', 'read', 'write', 'io',
    // 中文
    '文件', '读取', '写入', '文件操作',
    // 日语
    'ファイル', '読み込み', '書き込み',
    // 韩语
    '파일', '읽기', '쓰기',
    // 法语
    'fichier', 'lecture', 'écriture',
    // 德语
    'datei', 'lesen', 'schreiben',
    // 西班牙语
    'archivo', 'lectura', 'escritura',
  ],
  
  compress: [
    // 英文
    'compress', 'zip', 'unzip', 'archive', 'tar', 'gzip',
    // 中文
    '压缩', '解压', '归档',
    // 日语
    '圧縮', '解凍', 'アーカイブ',
    // 韩语
    '압축', '압축 해제', '아카이브',
    // 法语
    'compression', 'décompression', 'archive',
    // 德语
    'komprimieren', 'dekomprimieren', 'archiv',
    // 西班牙语
    'comprimir', 'descomprimir', 'archivo',
  ],
  
  // ============================================
  // 网络相关
  // ============================================
  network: [
    // 英文
    'network', 'socket', 'websocket', 'tcp', 'udp',
    // 中文
    '网络', '套接字', '网络连接',
    // 日语
    'ネットワーク', 'ソケット',
    // 韩语
    '네트워크', '소켓',
    // 法语
    'réseau', 'connexion réseau',
    // 德语
    'netzwerk', 'netzwerkverbindung',
    // 西班牙语
    'red', 'conexión de red',
  ],
  
  download: [
    // 英文
    'download', 'fetch', 'retrieve',
    // 中文
    '下载', '获取', '拉取',
    // 日语
    'ダウンロード', '取得',
    // 韩语
    '다운로드', '가져오기',
    // 法语
    'télécharger', 'téléchargement',
    // 德语
    'herunterladen', 'download',
    // 西班牙语
    'descargar', 'descarga',
  ],
  
  upload: [
    // 英文
    'upload', 'send',
    // 中文
    '上传', '发送',
    // 日语
    'アップロード', '送信',
    // 韩语
    '업로드', '전송',
    // 法语
    'téléverser', 'envoyer',
    // 德语
    'hochladen', 'upload',
    // 西班牙语
    'subir', 'cargar',
  ],
  
  // ============================================
  // 安全相关
  // ============================================
  security: [
    // 英文
    'security', 'encrypt', 'decrypt', 'hash', 'token',
    // 中文
    '安全', '加密', '解密', '哈希', '令牌',
    // 日语
    'セキュリティ', '暗号化', '復号化', 'ハッシュ',
    // 韩语
    '보안', '암호화', '복호화', '해시',
    // 法语
    'sécurité', 'chiffrement', 'déchiffrement',
    // 德语
    'sicherheit', 'verschlüsselung', 'entschlüsselung',
    // 西班牙语
    'seguridad', 'cifrado', 'descifrado',
  ],
  
  auth: [
    // 英文
    'auth', 'authentication', 'authorization', 'login', 'oauth',
    // 中文
    '认证', '授权', '登录', '身份验证',
    // 日语
    '認証', '認可', 'ログイン',
    // 韩语
    '인증', '권한 부여', '로그인',
    // 法语
    'authentification', 'autorisation', 'connexion',
    // 德语
    'authentifizierung', 'autorisierung', 'anmeldung',
    // 西班牙语
    'autenticación', 'autorización', 'inicio de sesión',
  ],
  
  // ============================================
  // 自动化
  // ============================================
  automation: [
    // 英文
    'automation', 'automate', 'script', 'batch',
    // 中文
    '自动化', '批量', '脚本', '自动处理',
    // 日语
    '自動化', 'オートメーション', 'バッチ処理',
    // 韩语
    '자동화', '배치 처리', '스크립트',
    // 法语
    'automatisation', 'traitement par lots',
    // 德语
    'automatisierung', 'stapelverarbeitung',
    // 西班牙语
    'automatización', 'procesamiento por lotes',
  ],
  
  crawler: [
    // 英文
    'crawler', 'scraper', 'spider', 'scrape',
    // 中文
    '爬虫', '抓取', '网页爬取',
    // 日语
    'クローラー', 'スクレイピング', 'ウェブスクレイピング',
    // 韩语
    '크롤러', '스크래핑', '웹 스크래핑',
    // 法语
    'robot d\'indexation', 'scraping',
    // 德语
    'crawler', 'web-scraping',
    // 西班牙语
    'rastreador', 'raspado web',
  ],
  
  // ============================================
  // 转换操作
  // ============================================
  convert: [
    // 英文
    'convert', 'transform', 'translate',
    // 中文
    '转换', '翻译', '变换',
    // 日语
    '変換', '翻訳', 'コンバート',
    // 韩语
    '변환', '번역', '컨버트',
    // 法语
    'convertir', 'transformer', 'traduire',
    // 德语
    'konvertieren', 'umwandeln', 'übersetzen',
    // 西班牙语
    'convertir', 'transformar', 'traducir',
  ],
  
  format: [
    // 英文
    'format', 'beautify', 'prettify', 'lint',
    // 中文
    '格式化', '美化', '代码格式化',
    // 日语
    'フォーマット', '整形', 'コード整形',
    // 韩语
    '포맷', '포매팅', '코드 정리',
    // 法语
    'formater', 'formatage', 'mise en forme',
    // 德语
    'formatieren', 'formatierung',
    // 西班牙语
    'formatear', 'formato',
  ],
  
  // ============================================
  // 生成操作
  // ============================================
  generate: [
    // 英文
    'generate', 'create', 'build',
    // 中文
    '生成', '创建', '构建',
    // 日语
    '生成', '作成', 'ビルド',
    // 韩语
    '생성', '만들기', '빌드',
    // 法语
    'générer', 'créer', 'construire',
    // 德语
    'generieren', 'erstellen', 'bauen',
    // 西班牙语
    'generar', 'crear', 'construir',
  ],
  
  template: [
    // 英文
    'template', 'scaffold', 'boilerplate',
    // 中文
    '模板', '脚手架', '样板',
    // 日语
    'テンプレート', 'スキャフォールド', 'ボイラープレート',
    // 韩语
    '템플릿', '스캐폴드', '보일러플레이트',
    // 法语
    'modèle', 'gabarit',
    // 德语
    'vorlage', 'schablone',
    // 西班牙语
    'plantilla', 'modelo',
  ],
};
