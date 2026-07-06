package br.com.musicmaker

import android.Manifest
import android.app.Activity
import android.app.DownloadManager
import android.content.ActivityNotFoundException
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.graphics.Bitmap
import android.net.ConnectivityManager
import android.net.NetworkCapabilities
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.os.Environment
import android.provider.MediaStore
import android.util.Log
import android.view.View
import android.webkit.CookieManager
import android.webkit.DownloadListener
import android.webkit.GeolocationPermissions
import android.webkit.JsResult
import android.webkit.PermissionRequest
import android.webkit.SslErrorHandler
import android.webkit.URLUtil
import android.webkit.ValueCallback
import android.webkit.WebChromeClient
import android.webkit.WebResourceRequest
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import android.widget.Toast
import androidx.activity.OnBackPressedCallback
import androidx.activity.result.contract.ActivityResultContracts
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.ContextCompat
import androidx.core.content.FileProvider
import androidx.core.splashscreen.SplashScreen.Companion.installSplashScreen
import androidx.webkit.WebSettingsCompat
import androidx.webkit.WebViewFeature
import br.com.musicmaker.databinding.ActivityMainBinding
import java.io.File
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

class MainActivity : AppCompatActivity() {

    // =========================================================
    // CONSTANTE PRINCIPAL — altere aqui para trocar a URL do app
    // =========================================================
    companion object {
        private const val APP_URL = "http://18.229.124.123:8080/"
        private const val TAG     = "MusicMakersWebView"
    }

    // View Binding
    private lateinit var binding: ActivityMainBinding

    // Upload de arquivo: callback do WebChromeClient
    private var fileUploadCallback: ValueCallback<Array<Uri>>? = null

    // URI da foto tirada pela câmera
    private var cameraImageUri: Uri? = null

    // =========================================================
    // Launchers de ActivityResult (substitui startActivityForResult)
    // =========================================================

    /** Abre seletor de arquivo/imagem para upload no WebView */
    private val filePickerLauncher = registerForActivityResult(
        ActivityResultContracts.StartActivityForResult()
    ) { result ->
        val uris: Array<Uri>? = when {
            result.resultCode != Activity.RESULT_OK -> null
            result.data?.clipData != null -> {
                val clip = result.data!!.clipData!!
                Array(clip.itemCount) { i -> clip.getItemAt(i).uri }
            }
            result.data?.data != null -> arrayOf(result.data!!.data!!)
            cameraImageUri != null -> arrayOf(cameraImageUri!!)
            else -> null
        }
        fileUploadCallback?.onReceiveValue(uris)
        fileUploadCallback = null
        cameraImageUri = null
    }

    /** Solicita múltiplas permissões de runtime */
    private val permissionLauncher = registerForActivityResult(
        ActivityResultContracts.RequestMultiplePermissions()
    ) { permissions ->
        val allGranted = permissions.values.all { it }
        if (allGranted) {
            Log.d(TAG, "Todas as permissões concedidas.")
        } else {
            Toast.makeText(this, "Algumas permissões foram negadas.", Toast.LENGTH_SHORT).show()
        }
    }

    // =========================================================
    // onCreate
    // =========================================================
    override fun onCreate(savedInstanceState: Bundle?) {
        // Splash Screen API oficial — deve ser chamado ANTES do super.onCreate
        installSplashScreen()

        super.onCreate(savedInstanceState)

        binding = ActivityMainBinding.inflate(layoutInflater)
        setContentView(binding.root)

        solicitarPermissoes()
        configurarWebView()
        configurarBotaoTentarNovamente()
        configurarBotaoVoltar()
        carregarUrl()
    }

    // =========================================================
    // Permissões
    // =========================================================
    private fun solicitarPermissoes() {
        val permissoes = mutableListOf(Manifest.permission.CAMERA)

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            permissoes += Manifest.permission.READ_MEDIA_IMAGES
            permissoes += Manifest.permission.READ_MEDIA_VIDEO
            permissoes += Manifest.permission.POST_NOTIFICATIONS
        } else {
            permissoes += Manifest.permission.READ_EXTERNAL_STORAGE
            if (Build.VERSION.SDK_INT < Build.VERSION_CODES.Q) {
                permissoes += Manifest.permission.WRITE_EXTERNAL_STORAGE
            }
        }

        val faltando = permissoes.filter {
            ContextCompat.checkSelfPermission(this, it) != PackageManager.PERMISSION_GRANTED
        }
        if (faltando.isNotEmpty()) {
            permissionLauncher.launch(faltando.toTypedArray())
        }
    }

    // =========================================================
    // Configuração do WebView
    // =========================================================
    private fun configurarWebView() {
        val webView = binding.webView

        // Ativa modo de depuração em builds de debug
        WebView.setWebContentsDebuggingEnabled(
            applicationInfo.flags and android.content.pm.ApplicationInfo.FLAG_DEBUGGABLE != 0
        )

        webView.settings.apply {
            // JavaScript completo
            javaScriptEnabled = true

            // DOM Storage (localStorage + sessionStorage)
            domStorageEnabled = true

            // Cache para carregamento mais rápido (usa cache quando disponível)
            cacheMode = WebSettings.LOAD_DEFAULT

            // Banco de dados interno (HTML5 databases)
            @Suppress("DEPRECATION")
            databaseEnabled = true

            // Permite que o WebView abra links dentro de si mesmo
            setSupportMultipleWindows(false)
            javaScriptCanOpenWindowsAutomatically = true

            // Suporte a zoom
            setSupportZoom(false)
            builtInZoomControls = false
            displayZoomControls = false

            // Melhor renderização
            loadsImagesAutomatically = true
            mediaPlaybackRequiresUserGesture = false

            // Conteúdo misto (HTTP dentro de HTTPS e vice-versa)
            @Suppress("DEPRECATION")
            mixedContentMode = WebSettings.MIXED_CONTENT_ALWAYS_ALLOW

            // User-Agent idêntico ao Chrome no Android
            userAgentString = userAgentString.replace(
                "wv",
                ""
            ).trim()

            // Permite acesso a arquivos (necessário para algumas PWAs)
            allowFileAccess = true
            allowContentAccess = true

            // Encoding padrão
            defaultTextEncodingName = "UTF-8"
        }

        // Cookies persistentes
        val cookieManager = CookieManager.getInstance()
        cookieManager.setAcceptCookie(true)
        cookieManager.setAcceptThirdPartyCookies(webView, true)

        // Safe Browsing (disponível em API 27+)
        if (WebViewFeature.isFeatureSupported(WebViewFeature.SAFE_BROWSING_ENABLE)) {
            WebSettingsCompat.setSafeBrowsingEnabled(webView.settings, false)
        }

        // Força modo claro (não aplica dark-mode automático do Android ao WebView)
        if (WebViewFeature.isFeatureSupported(WebViewFeature.ALGORITHMIC_DARKENING)) {
            WebSettingsCompat.setAlgorithmicDarkeningAllowed(webView.settings, false)
        }

        webView.webViewClient  = criarWebViewClient()
        webView.webChromeClient = criarWebChromeClient()

        // Download Manager
        webView.setDownloadListener(criarDownloadListener())
    }

    // =========================================================
    // WebViewClient — navegação, SSL, links externos
    // =========================================================
    private fun criarWebViewClient() = object : WebViewClient() {

        override fun shouldOverrideUrlLoading(view: WebView, request: WebResourceRequest): Boolean {
            val url = request.url.toString()
            return tratarUrl(url)
        }

        override fun onPageStarted(view: WebView, url: String, favicon: Bitmap?) {
            super.onPageStarted(view, url, favicon)
            binding.progressBar.visibility = View.VISIBLE
            binding.layoutOffline.visibility = View.GONE
            Log.d(TAG, "Página iniciando: $url")
        }

        override fun onPageFinished(view: WebView, url: String) {
            super.onPageFinished(view, url)
            binding.progressBar.visibility = View.GONE

            // Persiste cookies após cada página carregada
            CookieManager.getInstance().flush()
            Log.d(TAG, "Página carregada: $url")
        }

        override fun onReceivedError(
            view: WebView,
            errorCode: Int,
            description: String,
            failingUrl: String
        ) {
            @Suppress("DEPRECATION")
            super.onReceivedError(view, errorCode, description, failingUrl)
            Log.e(TAG, "Erro no WebView ($errorCode): $description — URL: $failingUrl")

            if (!temInternet()) {
                binding.progressBar.visibility = View.GONE
                binding.layoutOffline.visibility = View.VISIBLE
            }
        }

        @Suppress("DEPRECATION")
        override fun onReceivedSslError(
            view: WebView,
            handler: SslErrorHandler,
            error: android.net.http.SslError
        ) {
            // Em produção, mude para handler.cancel() para segurança máxima.
            // Por ora, aceita SSL para permitir certificados auto-assinados em dev.
            Log.w(TAG, "Erro SSL detectado: ${error.primaryError}")
            handler.proceed()
        }
    }

    // =========================================================
    // WebChromeClient — alertas JS, permissões, upload de arquivo
    // =========================================================
    private fun criarWebChromeClient() = object : WebChromeClient() {

        // Progress bar do site
        override fun onProgressChanged(view: WebView, newProgress: Int) {
            if (newProgress < 100) {
                binding.progressBar.visibility = View.VISIBLE
                binding.progressBar.progress = newProgress
            } else {
                binding.progressBar.visibility = View.GONE
            }
        }

        // Título da página
        override fun onReceivedTitle(view: WebView, title: String) {
            Log.d(TAG, "Título da página: $title")
        }

        // Alertas JavaScript (alert(), confirm(), prompt())
        override fun onJsAlert(view: WebView, url: String, message: String, result: JsResult): Boolean {
            androidx.appcompat.app.AlertDialog.Builder(this@MainActivity)
                .setMessage(message)
                .setPositiveButton("OK") { _, _ -> result.confirm() }
                .setCancelable(false)
                .show()
            return true
        }

        override fun onJsConfirm(view: WebView, url: String, message: String, result: JsResult): Boolean {
            androidx.appcompat.app.AlertDialog.Builder(this@MainActivity)
                .setMessage(message)
                .setPositiveButton("OK")     { _, _ -> result.confirm() }
                .setNegativeButton("Cancelar") { _, _ -> result.cancel() }
                .setCancelable(false)
                .show()
            return true
        }

        // Geolocalização (solicita permissão ao usuário se o site pedir)
        override fun onGeolocationPermissionsShowPrompt(
            origin: String,
            callback: GeolocationPermissions.Callback
        ) {
            callback.invoke(origin, true, false)
        }

        // Permissões do WebView (câmera, microfone)
        override fun onPermissionRequest(request: PermissionRequest) {
            request.grant(request.resources)
        }

        // Upload de arquivo — chamado quando <input type="file"> é acionado
        override fun onShowFileChooser(
            webView: WebView,
            filePathCallback: ValueCallback<Array<Uri>>,
            fileChooserParams: FileChooserParams
        ): Boolean {
            // Cancela callback anterior se existir
            fileUploadCallback?.onReceiveValue(null)
            fileUploadCallback = filePathCallback

            abrirSeletorDeArquivo(fileChooserParams)
            return true
        }
    }

    // =========================================================
    // Seletor de arquivo / câmera para upload
    // =========================================================
    private fun abrirSeletorDeArquivo(params: WebChromeClient.FileChooserParams) {
        val intentLista = mutableListOf<Intent>()

        // Intent da câmera
        val cameraIntent = Intent(MediaStore.ACTION_IMAGE_CAPTURE).also { intent ->
            intent.resolveActivity(packageManager)?.let {
                val fotoFile = criarArquivoTemporario()
                cameraImageUri = FileProvider.getUriForFile(
                    this,
                    "${applicationId}.fileprovider",
                    fotoFile
                )
                intent.putExtra(MediaStore.EXTRA_OUTPUT, cameraImageUri)
                intentLista.add(intent)
            }
        }

        // Intent do seletor de conteúdo (galeria / arquivos)
        val seletorIntent = Intent(Intent.ACTION_GET_CONTENT).apply {
            addCategory(Intent.CATEGORY_OPENABLE)
            type = "*/*"
            if (params.acceptTypes?.isNotEmpty() == true) {
                val tipos = params.acceptTypes!!.filter { it.isNotBlank() }.toTypedArray()
                if (tipos.size == 1) {
                    type = tipos[0]
                } else if (tipos.size > 1) {
                    putExtra(Intent.EXTRA_MIME_TYPES, tipos)
                }
            }
            if (params.mode == WebChromeClient.FileChooserParams.MODE_OPEN_MULTIPLE) {
                putExtra(Intent.EXTRA_ALLOW_MULTIPLE, true)
            }
        }

        // Chooser combinando câmera + galeria
        val chooserIntent = Intent.createChooser(seletorIntent, "Selecionar arquivo")
        chooserIntent.putExtra(
            Intent.EXTRA_INITIAL_INTENTS,
            intentLista.toTypedArray()
        )

        try {
            filePickerLauncher.launch(chooserIntent)
        } catch (e: ActivityNotFoundException) {
            fileUploadCallback?.onReceiveValue(null)
            fileUploadCallback = null
            Toast.makeText(this, "Nenhum app para selecionar arquivo.", Toast.LENGTH_SHORT).show()
        }
    }

    /** Cria arquivo temporário para armazenar foto da câmera */
    private fun criarArquivoTemporario(): File {
        val timestamp = SimpleDateFormat("yyyyMMdd_HHmmss", Locale.getDefault()).format(Date())
        val dir = getExternalFilesDir(Environment.DIRECTORY_PICTURES)
        return File.createTempFile("FOTO_${timestamp}_", ".jpg", dir)
    }

    // =========================================================
    // Download Manager
    // =========================================================
    private fun criarDownloadListener() = DownloadListener { url, userAgent, contentDisposition, mimeType, _ ->
        try {
            val request = DownloadManager.Request(Uri.parse(url)).apply {
                setMimeType(mimeType)
                addRequestHeader("Cookie", CookieManager.getInstance().getCookie(url))
                addRequestHeader("User-Agent", userAgent)
                setDescription("Fazendo download do arquivo...")
                setTitle(URLUtil.guessFileName(url, contentDisposition, mimeType))
                setNotificationVisibility(DownloadManager.Request.VISIBILITY_VISIBLE_NOTIFY_COMPLETED)
                setDestinationInExternalPublicDir(
                    Environment.DIRECTORY_DOWNLOADS,
                    URLUtil.guessFileName(url, contentDisposition, mimeType)
                )
            }
            val dm = getSystemService(Context.DOWNLOAD_SERVICE) as DownloadManager
            dm.enqueue(request)
            Toast.makeText(this, "Download iniciado!", Toast.LENGTH_SHORT).show()
        } catch (e: Exception) {
            Log.e(TAG, "Erro ao iniciar download: ${e.message}")
            Toast.makeText(this, "Não foi possível iniciar o download.", Toast.LENGTH_SHORT).show()
        }
    }

    // =========================================================
    // Tratamento de URLs (links externos)
    // =========================================================
    private fun tratarUrl(url: String): Boolean {
        return when {
            // WhatsApp
            url.startsWith("whatsapp://") || url.contains("wa.me") || url.contains("api.whatsapp.com") -> {
                abrirIntentExterno(Intent(Intent.ACTION_VIEW, Uri.parse(url)))
                true
            }
            // Telefone
            url.startsWith("tel:") -> {
                abrirIntentExterno(Intent(Intent.ACTION_DIAL, Uri.parse(url)))
                true
            }
            // E-mail
            url.startsWith("mailto:") -> {
                abrirIntentExterno(Intent(Intent.ACTION_SENDTO, Uri.parse(url)))
                true
            }
            // Google Maps / Maps
            url.startsWith("geo:") || url.contains("maps.google") || url.contains("maps.app.goo.gl") -> {
                abrirIntentExterno(Intent(Intent.ACTION_VIEW, Uri.parse(url)))
                true
            }
            // Intent genérico (market://, fb://, etc.)
            !url.startsWith("http://") && !url.startsWith("https://") && !url.startsWith("file://") -> {
                try {
                    abrirIntentExterno(Intent(Intent.ACTION_VIEW, Uri.parse(url)))
                } catch (e: Exception) {
                    Log.w(TAG, "Não foi possível abrir o link: $url")
                }
                true
            }
            // Links do próprio app — navegar dentro do WebView
            else -> false
        }
    }

    private fun abrirIntentExterno(intent: Intent) {
        try {
            startActivity(intent)
        } catch (e: ActivityNotFoundException) {
            Toast.makeText(this, "App não encontrado para abrir este link.", Toast.LENGTH_SHORT).show()
        }
    }

    // =========================================================
    // Tela offline — botão "Tentar novamente"
    // =========================================================
    private fun configurarBotaoTentarNovamente() {
        binding.btnTentarNovamente.setOnClickListener {
            if (temInternet()) {
                binding.layoutOffline.visibility = View.GONE
                carregarUrl()
            } else {
                Toast.makeText(this, "Sem conexão. Verifique sua internet.", Toast.LENGTH_SHORT).show()
            }
        }
    }

    // =========================================================
    // Botão voltar — navega no WebView ou fecha o app
    // =========================================================
    private fun configurarBotaoVoltar() {
        onBackPressedDispatcher.addCallback(this, object : OnBackPressedCallback(true) {
            override fun handleOnBackPressed() {
                if (binding.webView.canGoBack()) {
                    binding.webView.goBack()
                } else {
                    isEnabled = false
                    onBackPressedDispatcher.onBackPressed()
                }
            }
        })
    }

    // =========================================================
    // Carregamento inicial
    // =========================================================
    private fun carregarUrl() {
        if (temInternet()) {
            binding.webView.loadUrl(APP_URL)
        } else {
            binding.progressBar.visibility = View.GONE
            binding.layoutOffline.visibility = View.VISIBLE
        }
    }

    // =========================================================
    // Verifica conectividade
    // =========================================================
    private fun temInternet(): Boolean {
        val cm = getSystemService(Context.CONNECTIVITY_SERVICE) as ConnectivityManager
        val network = cm.activeNetwork ?: return false
        val caps   = cm.getNetworkCapabilities(network) ?: return false
        return caps.hasCapability(NetworkCapabilities.NET_CAPABILITY_INTERNET)
    }

    // =========================================================
    // Ciclo de vida
    // =========================================================
    override fun onPause() {
        super.onPause()
        binding.webView.onPause()
        CookieManager.getInstance().flush()
    }

    override fun onResume() {
        super.onResume()
        binding.webView.onResume()
    }

    override fun onDestroy() {
        binding.webView.apply {
            stopLoading()
            destroy()
        }
        super.onDestroy()
    }
}