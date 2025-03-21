import Skeleton from 'react-loading-skeleton'

const SkeletonLoader = () => {
  return (
    <div className="skeleton-wrapper">
      <Skeleton height={50} className="mb-4" />
      <Skeleton count={4} height={40} className="mb-2" />
      <Skeleton height={200} className="mt-4" />
    </div>
  )
}

export default SkeletonLoader
