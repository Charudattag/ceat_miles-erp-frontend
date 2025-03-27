import React, { useState, useEffect, useCallback } from "react";
import { Card, Row, Col, Table, Badge, Spinner, Button } from "react-bootstrap";
import {
  FaBoxOpen,
  FaTag,
  FaWarehouse,
  FaShoppingCart,
  FaSync,
  FaExclamationTriangle,
  FaUserPlus,
} from "react-icons/fa";
import { toast } from "react-toastify";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
} from "chart.js";
import { Pie, Bar, Doughnut, PolarArea } from "react-chartjs-2";
import { FaChartPie } from "react-icons/fa";
import { useNavigate, Link } from "react-router-dom";
import ExportProductsPDF from "../Otherpages/ExportProductsPDF";

import {
  getAllproductsAPI,
  getAllcategoriesAPI,
  getAllVendorsAPI,
  getAllMediaAPI,
  getAllcustomerAPI,
} from "../../api/api";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title
);

const Dashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalCategories: 0,
    totalVendors: 0,
    totalCustomers: 0,
    lowStockProducts: [],
    totalInventoryValue: 0,
    productsWithImages: 0,
    productsWithoutImages: 0,
  });
  const [chartData, setChartData] = useState({
    categoryData: { labels: [], datasets: [{ data: [], backgroundColor: [] }] },
    priceRangeData: { labels: [], datasets: [{ data: [] }] },
  });
  const [topProducts, setTopProducts] = useState([]);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const fetchAllProducts = async () => {
    try {
      const firstPageResponse = await getAllproductsAPI({ page: 1, limit: 10 });

      if (!firstPageResponse?.success) {
        throw new Error("Failed to fetch products");
      }

      const totalPages = firstPageResponse.data.pagination.totalPages;
      let allProducts = [...firstPageResponse.data.products];

      if (totalPages > 1) {
        const pagePromises = [];
        for (let page = 2; page <= totalPages; page++) {
          pagePromises.push(getAllproductsAPI({ page, limit: 10 }));
        }

        const pageResponses = await Promise.all(pagePromises);

        pageResponses.forEach((response) => {
          if (response?.success) {
            allProducts = [...allProducts, ...response.data.products];
          }
        });
      }

      return allProducts;
    } catch (error) {
      console.error("Error fetching all products:", error);
      toast.error("Failed to fetch all products");
      return [];
    }
  };

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      const [categoriesRes, vendorsRes, customersRes, mediaRes] =
        await Promise.all([
          getAllcategoriesAPI({ page: 1, limit: 100 }),
          getAllVendorsAPI(),
          getAllcustomerAPI(),
          getAllMediaAPI(),
        ]);

      const products = await fetchAllProducts();

      const categories = categoriesRes?.success
        ? categoriesRes.data.categories
        : [];
      const vendors = vendorsRes?.success ? vendorsRes.data.vendors : [];
      const customers = customersRes?.success
        ? customersRes.data.customers
        : [];
      const media = mediaRes?.data?.media || [];

      const productsWithImagesSet = new Set();
      media.forEach((item) => {
        if (item.product_id && item.type === "IMAGE") {
          productsWithImagesSet.add(item.product_id);
        }
      });

      const lowStockProducts = products.filter((p) => p.available_stock < 10);

      const totalInventoryValue = products.reduce((sum, product) => {
        return (
          sum +
          parseFloat(product.price || 0) *
            parseFloat(product.available_stock || 0)
        );
      }, 0);

      const topProductsList = [...products]
        .sort((a, b) => parseFloat(b.price || 0) - parseFloat(a.price || 0))
        .slice(0, 5);

      setTopProducts(topProductsList);

      const categoryMap = {};
      categories.forEach((cat) => {
        categoryMap[cat.id] = cat.category_name;
      });

      const categoryCounts = {};
      products.forEach((product) => {
        if (product.category_id) {
          const catName = categoryMap[product.category_id] || "Uncategorized";
          categoryCounts[catName] = (categoryCounts[catName] || 0) + 1;
        }
      });

      const categoryChartData = {
        labels: [],
        datasets: [
          {
            data: [],
            backgroundColor: [
              "#FF6384",
              "#36A2EB",
              "#FFCE56",
              "#4BC0C0",
              "#9966FF",
              "#FF9F40",
              "#8AC249",
              "#EA5545",
              "#F46A9B",
              "#EF9B20",
            ],
            borderWidth: 1,
          },
        ],
      };

      Object.entries(categoryCounts).forEach(([name, count]) => {
        categoryChartData.labels.push(name);
        categoryChartData.datasets[0].data.push(count);
      });

      const priceRanges = [
        { range: "0-1000", count: 0 },
        { range: "1001-5000", count: 0 },
        { range: "5001-10000", count: 0 },
        { range: "10001+", count: 0 },
      ];

      products.forEach((product) => {
        const price = parseFloat(product.price || 0);
        if (price <= 1000) priceRanges[0].count++;
        else if (price <= 5000) priceRanges[1].count++;
        else if (price <= 10000) priceRanges[2].count++;
        else priceRanges[3].count++;
      });

      const priceRangeChartData = {
        labels: priceRanges.map((r) => r.range),
        datasets: [
          {
            label: "Number of Products",
            data: priceRanges.map((r) => r.count),
            backgroundColor: "rgba(54, 162, 235, 0.6)",
            borderColor: "rgba(54, 162, 235, 1)",
            borderWidth: 1,
          },
        ],
      };

      setChartData({
        categoryData: categoryChartData,
        priceRangeData: priceRangeChartData,
      });

      setStats({
        totalProducts: products.length,
        totalCategories: categories.length,
        totalVendors: vendors.length,
        totalCustomers: customers.length,
        customers: customers,
        lowStockProducts,
        totalInventoryValue,
        productsWithImages: productsWithImagesSet.size,
        productsWithoutImages: products.length - productsWithImagesSet.size,
      });

      setLastUpdated(new Date());
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();

    // Set up auto-refresh every 5 minutes
    const refreshInterval = setInterval(() => {
      setRefreshing(true);
      fetchDashboardData();
    }, 300000); // 5 minutes

    return () => clearInterval(refreshInterval);
  }, [fetchDashboardData]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  const navigateToProductDetail = (productId) => {
    navigate(`/productDetails/${productId}`);
  };

  if (loading) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ height: "80vh" }}
      >
        <Spinner animation="border" variant="primary" />
        <span className="ms-3">Loading dashboard data...</span>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Bespoke Solutions Dashboard</h2>
        <div>
          {/* <Button
            variant="outline-primary"
            onClick={handleRefresh}
            disabled={refreshing}
            className="d-flex align-items-center"
          >
            {refreshing ? (
              <>
                <Spinner size="sm" className="me-2" />
                Refreshing...
              </>
            ) : (
              <>
                <FaSync className="me-2" />
                Refresh
              </>
            )}
          </Button> */}
        </div>
      </div>

      {/* Key Metrics */}
      <Row className="g-4 mb-4">
        <Col md={3}>
          <Card
            className="h-100 shadow-sm border-0 dashboard-card"
            style={{
              background: "linear-gradient(135deg, #e0f7fa 0%, #b2ebf2 100%)",
              borderRadius: "12px",
              transition: "all 0.3s ease",
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = "translateY(-5px)";
              e.currentTarget.style.boxShadow = "0 8px 15px rgba(0,0,0,0.1)";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 4px 6px rgba(0,0,0,0.05)";
            }}
          >
            <Link
              to={"/product"}
              style={{ textDecoration: "none", color: "black" }}
            >
              <Card.Body className="d-flex align-items-center">
                <div className="rounded-circle bg-primary bg-opacity-10 p-3 me-3">
                  <FaBoxOpen size={24} className="text-primary" />
                </div>
                <div>
                  <h6 className="text-black mb-1">Total Products</h6>
                  <h3 className="mb-0">{stats.totalProducts}</h3>
                </div>
              </Card.Body>
            </Link>
          </Card>
        </Col>

        <Col md={3}>
          <Card
            className="h-100 shadow-sm border-0 dashboard-card"
            style={{
              background: "linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%)",
              borderRadius: "12px",
              transition: "all 0.3s ease",
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = "translateY(-5px)";
              e.currentTarget.style.boxShadow = "0 8px 15px rgba(0,0,0,0.1)";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 4px 6px rgba(0,0,0,0.05)";
            }}
          >
            <Link
              to={"/category"}
              style={{ textDecoration: "none", color: "black" }}
            >
              <Card.Body className="d-flex align-items-center">
                <div className="rounded-circle bg-success bg-opacity-10 p-3 me-3">
                  <FaTag size={24} className="text-success" />
                </div>
                <div>
                  <h6 className="text-black mb-1">Categories</h6>
                  <h3 className="mb-0">{stats.totalCategories}</h3>
                </div>
              </Card.Body>
            </Link>
          </Card>
        </Col>

        <Col md={3}>
          <Card
            className="h-100 shadow-sm border-0 dashboard-card"
            style={{
              background: "linear-gradient(135deg, #fff8e1 0%, #ffecb3 100%)",
              borderRadius: "12px",
              transition: "all 0.3s ease",
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = "translateY(-5px)";
              e.currentTarget.style.boxShadow = "0 8px 15px rgba(0,0,0,0.1)";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 4px 6px rgba(0,0,0,0.05)";
            }}
          >
            <Link
              to={"/customer"}
              style={{ textDecoration: "none", color: "black" }}
            >
              <Card.Body className="d-flex align-items-center">
                <div className="rounded-circle bg-warning bg-opacity-10 p-3 me-3">
                  <FaShoppingCart size={24} className="text-warning" />
                </div>
                <div>
                  <h6 className="text-black mb-1">Customers</h6>
                  <h3 className="mb-0">{stats.totalCustomers}</h3>
                </div>
              </Card.Body>
            </Link>
          </Card>
        </Col>

        <Col md={3}>
          <Card
            className="h-100 shadow-sm border-0 dashboard-card"
            style={{
              background: "linear-gradient(135deg, #e8eaf6 0%, #c5cae9 100%)",
              borderRadius: "12px",
              transition: "all 0.3s ease",
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = "translateY(-5px)";
              e.currentTarget.style.boxShadow = "0 8px 15px rgba(0,0,0,0.1)";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 4px 6px rgba(0,0,0,0.05)";
            }}
          >
            <Card.Body className="d-flex align-items-center">
              <div className="rounded-circle bg-info bg-opacity-10 p-3 me-3">
                <FaWarehouse size={24} className="text-info" />
              </div>
              <div>
                <h6 className="text-black mb-1">Vendors</h6>
                <h3 className="mb-0">{stats.totalVendors}</h3>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Charts Row */}
      <Row className="g-4 mb-4">
        <Col lg={7}>
          <Card
            className="h-100 shadow-sm border-0"
            style={{
              background: "white",
              borderRadius: "12px",
              transition: "all 0.3s ease",
              boxShadow:
                "0 10px 20px rgba(0,0,0,0.05), 0 6px 6px rgba(0,0,0,0.06)",
            }}
          >
            <Card.Header className="bg-transparent border-0 d-flex justify-content-between align-items-center">
              <h5 className="mb-0 text-dark">Products by Category</h5>
              <Badge bg="primary" className="px-3 py-2">
                {chartData.categoryData.labels.length} Categories
              </Badge>
            </Card.Header>
            <Card.Body>
              <div
                style={{
                  height: "250px",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  position: "relative",
                }}
              >
                {chartData.categoryData.labels.length > 0 ? (
                  <>
                    <Doughnut
                      data={{
                        ...chartData.categoryData,
                        datasets: [
                          {
                            ...chartData.categoryData.datasets[0],
                            backgroundColor: [
                              "rgba(255, 99, 132, 0.8)",
                              "rgba(54, 162, 235, 0.8)",
                              "rgba(255, 206, 86, 0.8)",
                              "rgba(75, 192, 192, 0.8)",
                              "rgba(153, 102, 255, 0.8)",
                              "rgba(255, 159, 64, 0.8)",
                              "rgba(199, 199, 199, 0.8)",
                              "rgba(83, 102, 255, 0.8)",
                              "rgba(78, 205, 196, 0.8)",
                              "rgba(255, 99, 71, 0.8)",
                            ],
                            borderColor: "white",
                            borderWidth: 2,
                            hoverBorderColor: "white",
                            hoverBorderWidth: 3,
                            hoverOffset: 10,
                          },
                        ],
                      }}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            position: "right",
                            labels: {
                              color: "#333",
                              boxWidth: 15,
                              padding: 15,
                              font: {
                                size: 12,
                                weight: "bold",
                              },
                              usePointStyle: true,
                              pointStyle: "circle",
                            },
                          },
                          tooltip: {
                            backgroundColor: "rgba(0, 0, 0, 0.8)",
                            titleFont: {
                              size: 14,
                              weight: "bold",
                            },
                            bodyFont: {
                              size: 13,
                            },
                            padding: 12,
                            cornerRadius: 8,
                            displayColors: true,
                            usePointStyle: true,
                            callbacks: {
                              label: function (context) {
                                const label = context.label || "";
                                const value = context.raw || 0;
                                const total = context.dataset.data.reduce(
                                  (acc, curr) => acc + curr,
                                  0
                                );
                                const percentage = Math.round(
                                  (value / total) * 100
                                );
                                return `${label}: ${value} (${percentage}%)`;
                              },
                            },
                          },
                        },
                        animation: {
                          animateScale: true,
                          animateRotate: true,
                          duration: 2000,
                          easing: "easeOutQuart",
                        },
                        cutout: "70%",
                        radius: "90%",
                      }}
                    />
                    <div
                      style={{
                        position: "absolute",
                        top: "50%",
                        left: "calc(50% - 50px)",
                        transform: "translate(-50%, -50%)",
                        textAlign: "center",
                        background: "rgba(245,247,250,0.9)",
                        borderRadius: "50%",
                        width: "100px",
                        height: "100px",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
                      }}
                    >
                      <div>
                        <h3 className="mb-0 text-black">
                          {chartData.categoryData.datasets[0].data.reduce(
                            (a, b) => a + b,
                            0
                          )}
                        </h3>
                        <p
                          className="mb-0 text-black"
                          style={{ fontSize: "12px" }}
                        >
                          Total Products
                        </p>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-center text-muted d-flex flex-column align-items-center">
                    <FaChartPie size={40} className="mb-3 text-muted" />
                    <p>No category data available</p>
                  </div>
                )}
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={5}>
          <Card
            className="h-100 shadow-sm border-0"
            style={{
              background: "white",
              borderRadius: "12px",
              boxShadow:
                "0 10px 20px rgba(0,0,0,0.05), 0 6px 6px rgba(0,0,0,0.06)",
            }}
          >
            <Card.Header className="bg-transparent border-0">
              <h5 className="mb-0 text-dark">Products by Price Range (Rs)</h5>
            </Card.Header>
            <Card.Body>
              <div style={{ height: "250px" }}>
                <Bar
                  data={{
                    ...chartData.priceRangeData,
                    datasets: [
                      {
                        ...chartData.priceRangeData.datasets[0],
                        backgroundColor: [
                          "rgba(255, 99, 132, 0.8)",
                          "rgba(54, 162, 235, 0.8)",
                          "rgba(255, 206, 86, 0.8)",
                          "rgba(75, 192, 192, 0.8)",
                        ],
                        borderColor: [
                          "rgba(255, 99, 132, 1)",
                          "rgba(54, 162, 235, 1)",
                          "rgba(255, 206, 86, 1)",
                          "rgba(75, 192, 192, 1)",
                        ],
                        borderWidth: 1,
                      },
                    ],
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        display: false,
                      },
                      tooltip: {
                        backgroundColor: "rgba(0, 0, 0, 0.8)",
                      },
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        grid: {
                          color: "rgba(0, 0, 0, 0.1)",
                        },
                        ticks: {
                          color: "rgba(0, 0, 0, 0.7)",
                        },
                      },
                      x: {
                        grid: {
                          display: false,
                        },
                        ticks: {
                          color: "rgba(0, 0, 0, 0.7)",
                        },
                      },
                    },
                  }}
                />
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Bottom Row */}
      <Row className="g-4">
        <Col md={6}>
          <Card className="h-100 shadow-sm border-0">
            <Card.Header className="bg-white border-0">
              <h5 className="mb-0">Top Products by Price</h5>
            </Card.Header>
            <Card.Body className="p-0">
              <Table hover responsive className="mb-0">
                <thead className="bg-light">
                  <tr>
                    <th>Product Name</th>
                    <th>Category</th>
                    <th className="text-end">Price (Rs)</th>
                  </tr>
                </thead>
                <tbody>
                  {topProducts.map((product) => (
                    <tr
                      key={product.id}
                      onClick={() => navigateToProductDetail(product.id)}
                      style={{ cursor: "pointer" }}
                    >
                      <td>{product.product_name}</td>
                      <td>
                        {product.category?.category_name || "Uncategorized"}
                      </td>
                      <td className="text-end fw-bold">
                        {parseFloat(product.price).toLocaleString("en-IN")}
                      </td>
                    </tr>
                  ))}
                  {topProducts.length === 0 && (
                    <tr>
                      <td colSpan="3" className="text-center py-3">
                        No products found
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6}>
          <Card className="h-100 shadow-sm border-0">
            <Card.Header className="bg-white border-0 d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Inventory Summary</h5>

              {/* <Badge bg="primary" pill>
                Total Value: ₹
                {stats.totalInventoryValue.toLocaleString("en-IN")}
              </Badge> */}
            </Card.Header>
            <Card.Body>
              <div className="mb-4">
                <h6 className="mb-3">Image Status</h6>
                <div className="d-flex align-items-center mb-2">
                  <div
                    className="progress flex-grow-1"
                    style={{ height: "25px" }}
                  >
                    <div
                      className="progress-bar bg-success"
                      role="progressbar"
                      style={{
                        width: `${
                          (stats.productsWithImages / stats.totalProducts) * 100
                        }%`,
                      }}
                      aria-valuenow={stats.productsWithImages}
                      aria-valuemin="0"
                      aria-valuemax={stats.totalProducts}
                    >
                      {stats.productsWithImages} with images
                    </div>
                    <div
                      className="progress-bar bg-danger"
                      role="progressbar"
                      style={{
                        width: `${
                          (stats.productsWithoutImages / stats.totalProducts) *
                          100
                        }%`,
                      }}
                      aria-valuenow={stats.productsWithoutImages}
                      aria-valuemin="0"
                      aria-valuemax={stats.totalProducts}
                    >
                      {stats.productsWithoutImages} without
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h6 className="mb-3">
                  <FaUserPlus className="text-info me-2" />
                  Latest Customer Leads
                </h6>
                <div
                  className="leads-container"
                  style={{ maxHeight: "150px", overflowY: "auto" }}
                >
                  {stats.customers && stats.customers.length > 0 ? (
                    <Table hover size="sm" className="mb-0">
                      <thead className="bg-light">
                        <tr>
                          <th>Customer</th>
                          <th className="text-end">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {stats.customers
                          .filter(
                            (customer) => customer.type_lead !== "CUSTOMER"
                          )
                          .sort((a, b) => b.id - a.id) // Sort by ID in descending order (newest first)
                          .slice(0, 5) // Take only the first 5
                          .map((customer) => (
                            <tr
                              key={customer.id}
                              onClick={() => navigate("/customer")}
                              style={{ cursor: "pointer" }}
                            >
                              <td>{customer.name}</td>
                              <td className="text-end">
                                <Badge
                                  bg={
                                    customer.type_lead === "IMPROGRESS LEAD"
                                      ? "primary"
                                      : customer.type_lead === "FUTURE LEAD"
                                      ? "success"
                                      : "secondary"
                                  }
                                >
                                  {customer.type_lead.replace(" LEAD", "")}
                                </Badge>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </Table>
                  ) : (
                    <div className="text-center text-muted py-3">
                      No leads available
                    </div>
                  )}
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Add CSS for dashboard cards */}
      <style jsx>{`
        .dashboard-card {
          transition: transform 0.2s;
        }
        .dashboard-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1) !important;
        }
        .low-stock-container::-webkit-scrollbar {
          width: 6px;
        }
        .low-stock-container::-webkit-scrollbar-track {
          background: #f1f1f1;
        }
        .low-stock-container::-webkit-scrollbar-thumb {
          background: #ddd;
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
};

export default Dashboard;
