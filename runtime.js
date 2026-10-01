(() => {
  const { createApp, reactive, ref, toRefs, h, nextTick, onMounted, onActivated, onDeactivated, onBeforeUnmount, KeepAlive, Fragment } = Vue
  const pageConfigs = {}
  const appState = { globalData: { userInfo: null } }
  const tabRoutes = window.__wxAppConfig.tabBar.list.map(item => item.pagePath)
  const initialLocation = parseUrl(location.hash.replace(/^#\/?/, ''))
  const startRoute = window.__wxAppConfig.pages.includes(initialLocation.route) ? initialLocation.route : tabRoutes[0]
  const routeStack = reactive([{ route: startRoute, options: initialLocation.options, key: 1 }])
  const activeIndex = ref(0)
  const titleOverride = ref('')
  const toast = ref('')
  const dialog = ref(null)
  const pageInstances = new Map()
  let nextKey = 2
  let toastTimer

  function currentEntry() { return routeStack[activeIndex.value] }
  function ensureCss(route) {
    const link = document.getElementById('page-style')
    const target = route + '.css'
    if (link.getAttribute('href') === target) return Promise.resolve()
    return new Promise(resolve => {
      link.onload = resolve
      link.onerror = resolve
      link.href = target
    })
  }
  function syncUrl(route) {
    history.replaceState(null, '', '#' + route)
    titleOverride.value = ''
    document.title = window.__wxPageMeta[route]?.navigationBarTitleText || '互动剧本'
  }
  function parseUrl(url) {
    const [route, query = ''] = String(url || '').replace(/^\//, '').split('?')
    return { route, options: Object.fromEntries(new URLSearchParams(query)) }
  }
  function pauseVideos() {
    document.querySelectorAll('.wx-page video').forEach(video => video.pause())
  }
  async function pushRoute(url, tab = false) {
    const { route, options } = parseUrl(url)
    if (!pageConfigs[route]) return
    pauseVideos()
    await ensureCss(route)
    if (tab) {
      const existing = routeStack.findIndex(entry => entry.route === route && tabRoutes.includes(entry.route))
      if (existing >= 0) activeIndex.value = existing
      else {
        routeStack.splice(activeIndex.value + 1)
        routeStack.push({ route, options, key: nextKey++ })
        activeIndex.value = routeStack.length - 1
      }
    } else {
      routeStack.splice(activeIndex.value + 1)
      routeStack.push({ route, options, key: nextKey++ })
      activeIndex.value = routeStack.length - 1
    }
    syncUrl(route)
  }
  async function navigateBack(delta = 1) {
    if (activeIndex.value <= 0) return
    pauseVideos()
    await ensureCss(routeStack[Math.max(0, activeIndex.value - delta)].route)
    const removed = routeStack.splice(activeIndex.value - delta + 1)
    for (const entry of removed) {
      const page = pageInstances.get(entry.key)
      if (page && typeof page.onUnload === 'function') page.onUnload()
      pageInstances.delete(entry.key)
    }
    activeIndex.value = Math.max(0, activeIndex.value - delta)
    syncUrl(currentEntry().route)
  }
  function screenSize() {
    const shell = document.querySelector('.wx-shell')
    return {
      windowWidth: shell?.clientWidth || Math.min(window.innerWidth, 430),
      windowHeight: shell?.clientHeight || window.innerHeight,
      pixelRatio: Math.min(window.devicePixelRatio || 1, 2),
      statusBarHeight: 28
    }
  }
  function selectFile(options, messageFile) {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = messageFile ? (options.type === 'file' ? 'audio/*' : '*/*') : (options.mediaType?.includes('video') ? 'image/*,video/*' : 'image/*')
    input.multiple = (options.count || 1) > 1
    input.onchange = () => {
      const files = [...input.files]
      const tempFiles = files.map(file => {
        const path = URL.createObjectURL(file)
        return { tempFilePath: path, path, name: file.name, size: file.size, fileType: file.type }
      })
      options.success?.({ tempFiles })
    }
    input.click()
  }
  function makeQuery() {
    let scope
    const requests = []
    return {
      in(page) { scope = page; return this },
      select(selector) { requests.push({ selector, mode: 'rect' }); return this },
      boundingClientRect() { requests[requests.length - 1].mode = 'rect'; return this },
      fields(fields) { requests[requests.length - 1].mode = 'fields'; requests[requests.length - 1].fields = fields; return this },
      exec(callback) {
        nextTick(() => {
          const root = scope ? document.querySelector(`.wx-page[data-entry="${scope.__entryKey}"]`) : document.querySelector('.wx-page-active')
          const results = requests.map(({ selector, mode }) => {
            const node = root?.querySelector(selector)
            if (!node) return null
            const rect = node.getBoundingClientRect()
            if (node instanceof HTMLCanvasElement && !node.requestAnimationFrame) {
              node.requestAnimationFrame = callback => requestAnimationFrame(callback)
              node.cancelAnimationFrame = id => cancelAnimationFrame(id)
            }
            return mode === 'fields'
              ? { node, width: rect.width, height: rect.height }
              : { id: node.id, width: rect.width, height: rect.height, top: rect.top, bottom: rect.bottom, left: rect.left, right: rect.right }
          })
          callback?.(results)
        })
        return this
      }
    }
  }
  function saveStorage(key, value) {
    try { localStorage.setItem('wx:' + key, JSON.stringify(value)) } catch (error) { console.warn(error) }
  }
  function readStorage(key) {
    try { const value = localStorage.getItem('wx:' + key); return value === null ? '' : JSON.parse(value) } catch { return '' }
  }
  function showToast({ title, duration = 2000 }) {
    toast.value = title || ''
    clearTimeout(toastTimer)
    toastTimer = setTimeout(() => { toast.value = '' }, duration)
  }
  const wx = {
    getSystemInfoSync: screenSize,
    getWindowInfo: screenSize,
    getStorageSync: readStorage,
    setStorageSync: saveStorage,
    removeStorageSync(key) { localStorage.removeItem('wx:' + key) },
    navigateTo({ url }) { setTimeout(() => pushRoute(url), 0) },
    navigateBack({ delta = 1 } = {}) { setTimeout(() => navigateBack(delta), 0) },
    switchTab({ url }) { setTimeout(() => pushRoute(url, true), 0) },
    setNavigationBarTitle({ title }) { titleOverride.value = title; document.title = title },
    createSelectorQuery: makeQuery,
    createVideoContext(id) {
      const video = document.getElementById(id)
      return {
        play() { video?.play()?.catch(() => {}) },
        pause() { video?.pause() },
        seek(time) { if (video) video.currentTime = time },
        stop() { if (video) { video.pause(); video.currentTime = 0 } }
      }
    },
    chooseMedia(options) { selectFile(options, false) },
    chooseMessageFile(options) { selectFile(options, true) },
    showToast,
    showModal(options) { dialog.value = options },
    showShareMenu() {},
    getUserProfile({ success }) { success?.({ userInfo: { nickName: '体验用户', avatarUrl: 'https://picsum.photos/seed/wx-demo-user/120/120', gender: 0 } }) },
    vibrateShort() { navigator.vibrate?.(20); return Promise.resolve() },
    vibrateLong() { navigator.vibrate?.(80); return Promise.resolve() },
    canvasToTempFilePath({ canvas, canvasId, success, fail }) {
      try { success?.({ tempFilePath: (canvas || document.getElementById(canvasId)).toDataURL('image/png') }) }
      catch (error) { fail?.(error) }
    },
    saveImageToPhotosAlbum({ filePath, success, fail }) {
      try {
        const anchor = document.createElement('a')
        anchor.href = filePath
        anchor.download = '剪纸作品.png'
        anchor.click()
        success?.()
      } catch (error) { fail?.(error) }
    }
  }
  window.wx = wx
  window.App = config => {
    Object.assign(appState, config)
    config.onLaunch?.call(appState)
  }
  window.getApp = () => appState
  window.Page = config => { pageConfigs[window.__capturePage] = config }

  function assignPath(target, path, value) {
    path = path.replace(/^_clueShow_c([12])$/, 'clueShow_c$1')
    const parts = path.replace(/\[(\d+)\]/g, '.$1').split('.')
    let object = target
    for (let index = 0; index < parts.length - 1; index++) {
      const part = parts[index]
      if (object[part] == null) object[part] = /^\d+$/.test(parts[index + 1]) ? [] : {}
      object = object[part]
    }
    object[parts[parts.length - 1]] = value
  }
  function dispatch(page, handler, nativeEvent) {
    const method = page[handler]
    if (typeof method !== 'function') return
    const target = nativeEvent.currentTarget || nativeEvent.target
    const source = nativeEvent.target
    const canvasRect = target instanceof HTMLCanvasElement ? target.getBoundingClientRect() : null
    const mapTouch = touch => {
      const clientX = canvasRect ? touch.clientX - canvasRect.left : touch.clientX
      const clientY = canvasRect ? touch.clientY - canvasRect.top : touch.clientY
      return { x: clientX, y: clientY, clientX, clientY, pageX: touch.pageX, pageY: touch.pageY }
    }
    const touches = nativeEvent.touches ? [...nativeEvent.touches].map(mapTouch) : undefined
    const changedTouches = nativeEvent.changedTouches ? [...nativeEvent.changedTouches].map(mapTouch) : undefined
    const detail = nativeEvent.detail && typeof nativeEvent.detail === 'object' ? { ...nativeEvent.detail } : {}
    if (source && 'value' in source) detail.value = source.value
    if (source instanceof HTMLMediaElement) {
      detail.currentTime = source.currentTime
      detail.duration = source.duration || 0
    }
    return method.call(page, {
      type: nativeEvent.type,
      target: { dataset: source?.dataset || {} },
      currentTarget: { dataset: target?.dataset || {} },
      detail,
      touches,
      changedTouches,
      preventDefault: () => nativeEvent.preventDefault?.(),
      stopPropagation: () => nativeEvent.stopPropagation?.()
    })
  }
  function asset(value) {
    if (typeof value !== 'string') return value
    const source = value.startsWith('/assets/') ? value.slice(1) : value
    return source.replace(/^assets\/icons\/([\w-]+)\.png$/, 'assets/ui-icons/$1.svg')
  }
  function bindCanvasPointers(page, entry) {
    const handlers = entry.route === 'pages/video/index'
      ? ['onGameTS', 'onGameTM', 'onGameTE']
      : /^pages\/game-(papercut|ball|parking)\/index$/.test(entry.route)
        ? ['onTouchStart', 'onTouchMove', 'onTouchEnd']
        : null
    if (!handlers) return () => {}
    const root = document.querySelector(`.wx-page[data-entry="${entry.key}"]`)
    if (!root) return () => {}
    let activePointer = null
    let activeCanvas = null
    function forward(handler, event) {
      const point = { clientX: event.clientX, clientY: event.clientY, pageX: event.pageX, pageY: event.pageY }
      dispatch(page, handler, {
        type: event.type,
        target: activeCanvas,
        currentTarget: activeCanvas,
        touches: [point],
        changedTouches: [point],
        preventDefault: () => event.preventDefault(),
        stopPropagation: () => event.stopPropagation()
      })
    }
    function onPointerDown(event) {
      if (!(event.target instanceof HTMLCanvasElement) || event.target.id === 'exportCanvas') return
      if (event.pointerType === 'touch' || event.button !== 0) return
      activePointer = event.pointerId
      activeCanvas = event.target
      activeCanvas.setPointerCapture?.(event.pointerId)
      forward(handlers[0], event)
    }
    function onPointerMove(event) {
      if (event.pointerId === activePointer) forward(handlers[1], event)
    }
    function onPointerEnd(event) {
      if (event.pointerId !== activePointer) return
      forward(handlers[2], event)
      activePointer = null
      activeCanvas = null
    }
    root.addEventListener('pointerdown', onPointerDown)
    root.addEventListener('pointermove', onPointerMove)
    root.addEventListener('pointerup', onPointerEnd)
    root.addEventListener('pointercancel', onPointerEnd)
    return () => {
      root.removeEventListener('pointerdown', onPointerDown)
      root.removeEventListener('pointermove', onPointerMove)
      root.removeEventListener('pointerup', onPointerEnd)
      root.removeEventListener('pointercancel', onPointerEnd)
    }
  }
  function createPageComponent(entry) {
    const config = pageConfigs[entry.route]
    return {
      name: 'WxPage' + entry.key,
      template: `<div class="wx-page wx-page-active" data-route="${entry.route}" data-entry="${entry.key}" data-native-nav="${window.__wxPageMeta[entry.route]?.navigationStyle !== 'custom' && !tabRoutes.includes(entry.route)}">${window.__wxTemplates[entry.route]}</div>`,
      setup() {
        const data = reactive(structuredClone(config.data || {}))
        if (entry.route === 'pages/video/index') {
          data.clueShow_c1 = false
          data.clueShow_c2 = false
        }
        const page = { ...config, data, __entryKey: entry.key }
        page.setData = updates => {
          for (const [path, value] of Object.entries(updates)) assignPath(data, path, value)
          if ('scrollToMsg' in updates) nextTick(() => document.getElementById(data.scrollToMsg)?.scrollIntoView({ block: 'end' }))
        }
        page.getTabBar = () => ({ setData() {} })
        page.createSelectorQuery = () => makeQuery().in(page)
        for (const [name, method] of Object.entries(config)) {
          if (typeof method === 'function') page[name] = method.bind(page)
        }
        pageInstances.set(entry.key, page)
        page.onLoad?.(entry.options)
        let removeCanvasPointers
        onMounted(() => nextTick(() => {
          page.onReady?.()
          removeCanvasPointers = bindCanvasPointers(page, entry)
        }))
        onActivated(() => page.onShow?.())
        onDeactivated(() => page.onHide?.())
        onBeforeUnmount(() => { removeCanvasPointers?.(); if (pageInstances.has(entry.key)) { page.onUnload?.(); pageInstances.delete(entry.key) } })
        return { ...toRefs(data), wxDispatch: (name, event) => dispatch(page, name, event), wxAsset: asset }
      }
    }
  }

  function flatChildren(nodes) {
    return nodes.flatMap(node => node.type === Fragment ? flatChildren(node.children || []) : [node])
  }
  const WxSwiper = {
    name: 'WxSwiper',
    inheritAttrs: false,
    props: { current: { default: 0 }, vertical: { default: false } },
    emits: ['change'],
    setup(props, { slots, emit, attrs }) {
      let startX = 0
      let startY = 0
      let lastWheel = 0
      let touchEligible = false
      let pointerEligible = false
      function canSwipe(event) {
        if (!props.vertical) return true
        const slide = event.target instanceof Element ? event.target.closest('.wx-swiper-slide') : null
        const content = slide?.querySelector('.content-area')
        const clientY = event.touches?.[0]?.clientY ?? event.changedTouches?.[0]?.clientY ?? event.clientY
        return !!content && Number.isFinite(clientY) && clientY >= content.getBoundingClientRect().bottom
      }
      function move(next) {
        const children = flatChildren(slots.default?.() || [])
        const index = Number(props.current) + next
        if (index >= 0 && index < children.length) emit('change', { detail: { current: index } })
      }
      function finish(x, y) {
        const distance = props.vertical ? y - startY : x - startX
        if (Math.abs(distance) > 40) move(distance < 0 ? 1 : -1)
      }
      return () => {
        const children = flatChildren(slots.default?.() || [])
        return h('div', {
          ...attrs,
          class: ['wx-swiper', attrs.class],
          onTouchstart: event => {
            touchEligible = canSwipe(event)
            if (touchEligible) { startX = event.touches[0].clientX; startY = event.touches[0].clientY }
          },
          onTouchend: event => {
            if (touchEligible) finish(event.changedTouches[0].clientX, event.changedTouches[0].clientY)
            touchEligible = false
          },
          onTouchcancel: () => { touchEligible = false },
          onPointerdown: event => {
            if (event.pointerType === 'touch') return
            pointerEligible = canSwipe(event)
            if (pointerEligible) { startX = event.clientX; startY = event.clientY }
          },
          onPointerup: event => {
            if (pointerEligible && event.pointerType !== 'touch') finish(event.clientX, event.clientY)
            pointerEligible = false
          },
          onPointercancel: () => { pointerEligible = false },
          onWheel: event => {
            if (!props.vertical || !canSwipe(event) || Math.abs(event.deltaY) < 12 || Date.now() - lastWheel < 420) return
            lastWheel = Date.now()
            move(event.deltaY > 0 ? 1 : -1)
          }
        }, children.map((child, index) => h('div', { class: 'wx-swiper-slide', style: { display: index === Number(props.current) ? 'block' : 'none' } }, [child])))
      }
    }
  }
  const WxPicker = {
    name: 'WxPicker',
    inheritAttrs: false,
    props: { range: { default: () => [] }, value: { default: 0 } },
    emits: ['change'],
    setup(props, { slots, emit, attrs }) {
      return () => h('div', { ...attrs, class: ['wx-picker', attrs.class] }, [
        slots.default?.(),
        h('select', {
          value: props.value,
          onChange: event => emit('change', { detail: { value: event.target.value } })
        }, (props.range || []).map((option, index) => h('option', { value: index, selected: index === Number(props.value) }, String(option))))
      ])
    }
  }
  const navNames = ['video', 'feed', 'create', 'message', 'profile']
  function navIcon(index, center, active) {
    return h('img', {
      class: ['tab-icon', center ? 'center-icon' : ''],
      src: `assets/ui-icons/${navNames[index]}${active ? '-active' : ''}.svg`,
      'aria-hidden': 'true'
    })
  }
  async function boot() {
    await ensureCss(startRoute)
    syncUrl(startRoute)
    const components = new Map()
    const Root = {
      setup() {
        const shell = ref(null)
        const width = ref(Math.min(window.innerWidth, 430))
        let observer
        onMounted(() => {
          observer = new ResizeObserver(entries => { width.value = entries[0].contentRect.width })
          observer.observe(shell.value)
        })
        onBeforeUnmount(() => observer?.disconnect())
        return () => {
          const entry = currentEntry()
          if (!components.has(entry.key)) components.set(entry.key, createPageComponent(entry))
          const route = entry.route
          const meta = window.__wxPageMeta[route] || {}
          const tabIndex = tabRoutes.indexOf(route)
          const nativeNav = meta.navigationStyle !== 'custom' && tabIndex < 0
          const isDark = route === 'pages/video/index' || route === 'pages/game-ball/index' || route === 'pages/game-parking/index'
          return h('div', { ref: shell, class: 'wx-shell', style: { '--rpx': width.value / 750 + 'px' } }, [
            h(KeepAlive, null, { default: () => h(components.get(entry.key), { key: entry.key }) }),
            nativeNav ? h('div', { class: 'wx-native-nav' }, [
              h('button', { class: 'wx-native-back', onClick: () => navigateBack() }, '‹'),
              h('span', titleOverride.value || meta.navigationBarTitleText || ''),
              h('div', { class: 'wx-capsule' }, [h('span', '···'), h('span', '◉')])
            ]) : null,
            route !== 'pages/game-lockscreen/index' ? h('div', { class: ['wx-status', isDark ? 'light' : ''] }, [
              h('span', new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', hour12: false })),
              h('span', { class: 'wx-status-right' }, [h('span', '▂▄▆'), h('span', '●'), h('span', { class: 'wx-status-battery' })])
            ]) : null,
            tabIndex >= 0 ? h('div', { class: 'tab-bar' }, [h('div', { class: 'tab-bar-inner' }, window.__wxAppConfig.tabBar.list.map((item, index) => h('div', {
              class: ['tab-item', item.text ? '' : 'center-tab'],
              onClick: () => pushRoute(item.pagePath, true)
            }, [
              h('div', { class: ['tab-icon-wrap', tabIndex === index ? 'active' : ''] }, [navIcon(index, !item.text, tabIndex === index)]),
              item.text ? h('span', { class: ['tab-text', tabIndex === index ? 'active' : ''] }, item.text) : null
            ])))]) : null,
            toast.value ? h('div', { class: 'wx-toast' }, toast.value) : null,
            dialog.value ? h('div', { class: 'wx-dialog-layer' }, [h('div', { class: 'wx-dialog' }, [
              h('div', { class: 'wx-dialog-title' }, dialog.value.title || '提示'),
              h('div', { class: 'wx-dialog-content' }, dialog.value.content || ''),
              h('div', { class: 'wx-dialog-actions' }, [
                dialog.value.showCancel !== false ? h('button', { onClick: () => { dialog.value.success?.({ confirm: false, cancel: true }); dialog.value = null } }, dialog.value.cancelText || '取消') : null,
                h('button', { onClick: () => { dialog.value.success?.({ confirm: true, cancel: false }); dialog.value = null } }, dialog.value.confirmText || '确定')
              ])
            ])]) : null
          ])
        }
      }
    }
    const app = createApp(Root)
    app.component('wx-swiper', WxSwiper)
    app.component('wx-picker', WxPicker)
    app.config.errorHandler = (error, instance, info) => {
      console.error('Page error:', error, info)
      showToast({ title: '页面出错，请查看控制台', duration: 4000 })
    }
    app.mount('#app')
  }
  document.addEventListener('DOMContentLoaded', boot)
})()
