import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaUsers, FaShoppingBag, FaBox, FaTags, FaPercent, FaThLarge } from 'react-icons/fa';
import Footer from '../Otherpages/Footer';
import './Dashboard.scss';

const DashboardCard = ({ title, value, icon, bgClass, link, percentage }) => (
  <div className="col-xl-4 col-lg-6 mb-4">
    <div className={`card ${bgClass} overflow-hidden`}>
      <div className="card-statistic-3 p-4">
        <Link to={link} className="text-white text-decoration-none">
          <div className="card-icon card-icon-large">
            {icon}
          </div>
          <div className="mb-4">
            <h5 className="card-title mb-0">{title}</h5>
          </div>
          <div className="row align-items-center mb-2 d-flex">
            <div className="col-8">
              <h2 className="d-flex align-items-center mb-0">
                {typeof value === 'number' && value >= 1000 ? value.toLocaleString() : value}
              </h2>
            </div>
            {percentage && (
              <div className="col-4 text-right">
                <span>
                  {percentage}% <i className="fa fa-arrow-up"></i>
                </span>
              </div>
            )}
          </div>
          <div className="progress mt-1" style={{ height: "8px" }}>
            <div
              className="progress-bar l-bg-cyan"
              role="progressbar"
              style={{ width: `${percentage || 25}%` }}
              aria-valuenow={percentage || 25}
              aria-valuemin="0"
              aria-valuemax="100"
            />
          </div>
        </Link>
      </div>
    </div>
  </div>
);

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    customers: 1234,
    orders: 789,
    products: 456,
    categories: 50,
    subcategories: 200,
    todayRate: 36000
  });

  // Simulating API call
  useEffect(() => {
    // In real implementation, replace with actual API calls
    const fetchDashboardData = async () => {
      try {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // In real implementation, fetch actual data here
        setDashboardData({
          customers: 1234,
          orders: 789,
          products: 456,
          categories: 50,
          subcategories: 200,
          todayRate: 36000
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <div className="container-fluid px-4">
      <h1 className="mt-4 mb-4">Dashboard Overview</h1>
      <div className="row">
        <DashboardCard
          title="Total Customers"
          value={dashboardData.customers}
          icon={<FaUsers size={30} />}
          bgClass="l-bg-blue-dark"
          link="/customer"
          percentage={9.23}
        />

        <DashboardCard
          title="Total Orders"
          value={dashboardData.orders}
          icon={<FaShoppingBag size={30} />}
          bgClass="l-bg-cherry"
          link="/orders"
          percentage={12.45}
        />

        <DashboardCard
          title="Total Products"
          value={dashboardData.products}
          icon={<FaBox size={30} />}
          bgClass="l-bg-green-dark"
          link="/product"
          percentage={5}
        />

        <DashboardCard
          title="Total Categories"
          value={dashboardData.categories}
          icon={<FaTags size={30} />}
          bgClass="l-bg-orange-dark"
          link="/category"
          percentage={3}
        />

        <DashboardCard
          title="Total Subcategories"
          value={dashboardData.subcategories}
          icon={<FaThLarge size={30} />}
          bgClass="l-bg-green"
          link="/subcategories"
          percentage={7}
        />

        <DashboardCard
          title="Today's Rate"
          value={`₹${dashboardData.todayRate.toLocaleString()}`}
          icon={<FaPercent size={30} />}
          bgClass="l-bg-orange"
          link="/rates"
          percentage={1}
        />
      </div>

      <div style={{ marginTop: '2rem' }}>
        <Footer />
      </div>
    </div>
  );
};

export default Dashboard;