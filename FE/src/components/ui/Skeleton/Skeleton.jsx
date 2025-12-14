import './Skeleton.css'

const Skeleton = ({ variant = 'text', width, height, count = 1, className = '' }) => {
    const skeletons = Array.from({ length: count }, (_, index) => index)

    const getVariantStyle = () => {
        switch (variant) {
            case 'text':
                return { height: '1rem', width: width || '100%' }
            case 'title':
                return { height: '2rem', width: width || '60%' }
            case 'circular':
                return { borderRadius: '50%', width: width || '40px', height: height || '40px' }
            case 'rectangular':
                return { width: width || '100%', height: height || '200px' }
            case 'card':
                return { width: width || '100%', height: height || '300px', borderRadius: '8px' }
            default:
                return { width: width || '100%', height: height || '1rem' }
        }
    }

    return (
        <>
            {skeletons.map((index) => (
                <div
                    key={index}
                    className={`skeleton ${className}`}
                    style={getVariantStyle()}
                    aria-busy="true"
                    aria-label="Loading..."
                />
            ))}
        </>
    )
}

export default Skeleton
