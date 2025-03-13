// usePullToLoad.ts
import { ref, onUnmounted } from 'vue'

export function usePullToLoad(
    onLoad,
    options = {}
) {
    const {
        triggerDistance = 30,
        throttleTime = 800,
        rootMargin = '0px'
    } = options

    const isLoading = ref(false)
    const isAtBottom = ref(false)
    const startY = ref(0)

    const observer = new IntersectionObserver(
        ([entry]) => {
            isAtBottom.value = entry.isIntersecting
        },
        { root: null, rootMargin, threshold: 0.1 }
    )

    const handleTouchStart = (e) => {
        startY.value = e.touches[0].clientY
    }

    const handleTouchMove = (e) => {
        if (!isAtBottom.value || isLoading.value) return

        const currentY = e.touches[0].clientY
        const deltaY = startY.value - currentY

        if (deltaY > triggerDistance) {
            triggerLoad()
        }
    }

    const checkAfterScrollStop = () => {
        if (isAtBottom.value) {
            triggerLoad()
        }
    }

    const triggerLoad = async () => {
        if (isLoading.value) return
        isLoading.value = true

        try {
            await onLoad()
        } finally {
            setTimeout(() => {
                isLoading.value = false
            }, throttleTime)
        }
    }

    const init = (bottomMarker) => {
        observer.observe(bottomMarker)
        document.addEventListener('touchstart', handleTouchStart, { passive: true })
        document.addEventListener('touchmove', handleTouchMove, { passive: true })
        window.addEventListener('scroll', checkAfterScrollStop, { passive: true })
    }

    const cleanup = () => {
        observer.disconnect()
        document.removeEventListener('touchstart', handleTouchStart)
        document.removeEventListener('touchmove', handleTouchMove)
        document.removeEventListener('scroll', checkAfterScrollStop)
    }

    return { init, cleanup, isLoading, isAtBottom }
}
