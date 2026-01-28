import { useState, useEffect, useRef } from 'react'
import './Flashlight.css'

function Flashlight() {
    const [position, setPosition] = useState({ x: window.innerWidth / 2, y: window.innerHeight / 2 })
    const [isDragging, setIsDragging] = useState(false)
    const [isHolding, setIsHolding] = useState(false)
    const flashlightRef = useRef(null)
    const dragOffset = useRef({ x: 0, y: 0 })

    useEffect(() => {
        const handleMouseMove = (e) => {
            if (isDragging) {
                setPosition({
                    x: e.clientX - dragOffset.current.x,
                    y: e.clientY - dragOffset.current.y
                })
            }
        }

        const handleMouseUp = () => {
            setIsDragging(false)
            setIsHolding(false)
        }

        const handleTouchMove = (e) => {
            if (isDragging && e.touches[0]) {
                setPosition({
                    x: e.touches[0].clientX - dragOffset.current.x,
                    y: e.touches[0].clientY - dragOffset.current.y
                })
            }
        }

        const handleTouchEnd = () => {
            setIsDragging(false)
            setIsHolding(false)
        }

        document.addEventListener('mousemove', handleMouseMove)
        document.addEventListener('mouseup', handleMouseUp)
        document.addEventListener('touchmove', handleTouchMove, { passive: false })
        document.addEventListener('touchend', handleTouchEnd)

        return () => {
            document.removeEventListener('mousemove', handleMouseMove)
            document.removeEventListener('mouseup', handleMouseUp)
            document.removeEventListener('touchmove', handleTouchMove)
            document.removeEventListener('touchend', handleTouchEnd)
        }
    }, [isDragging])

    const handleMouseDown = (e) => {
        e.preventDefault()
        const rect = flashlightRef.current.getBoundingClientRect()
        dragOffset.current = {
            x: e.clientX - rect.left - rect.width / 2,
            y: e.clientY - rect.top - rect.height / 2
        }
        setIsDragging(true)
        setIsHolding(true)
    }

    const handleTouchStart = (e) => {
        e.preventDefault()
        if (e.touches[0]) {
            const rect = flashlightRef.current.getBoundingClientRect()
            dragOffset.current = {
                x: e.touches[0].clientX - rect.left - rect.width / 2,
                y: e.touches[0].clientY - rect.top - rect.height / 2
            }
            setIsDragging(true)
            setIsHolding(true)
        }
    }

    return (
        <>
            {/* Dark overlay with spotlight cutout */}
            <div
                className="flashlight-overlay"
                style={{
                    background: isHolding
                        ? `radial-gradient(circle 180px at ${position.x}px ${position.y}px, 
                transparent 0%, 
                transparent 60%,
                rgba(0, 0, 0, 0.7) 80%, 
                rgba(0, 0, 0, 0.95) 100%)`
                        : 'rgba(0, 0, 0, 0.97)'
                }}
            />

            {/* Light beam effect when holding */}
            {isHolding && (
                <div
                    className="flashlight-beam"
                    style={{
                        left: position.x,
                        top: position.y
                    }}
                />
            )}

            {/* Flashlight icon */}
            <div
                ref={flashlightRef}
                className={`flashlight-icon ${isDragging ? 'dragging' : ''} ${isHolding ? 'active' : ''}`}
                style={{
                    left: position.x,
                    top: position.y
                }}
                onMouseDown={handleMouseDown}
                onTouchStart={handleTouchStart}
            >
                <div className="flashlight-body">
                    <div className="flashlight-head">
                        <div className={`flashlight-lens ${isHolding ? 'on' : ''}`} />
                    </div>
                    <div className="flashlight-handle" />
                </div>
                <span className="flashlight-hint">
                    {isHolding ? 'release to turn off' : 'hold & drag to shine'}
                </span>
            </div>
        </>
    )
}

export default Flashlight
