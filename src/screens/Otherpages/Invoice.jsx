import React, { useEffect } from "react";
import "./Invoice.css";
import logo from "../../assets/logo_1.png";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import {
  getOrderdetailsByOrderIdAPI,
  getlatestAllRatesAPI,
} from "../../api/api";
import { useParams, Link } from "react-router-dom";

export const downloadInvoice = (InvoiceNo) => {
  const invoice = document.querySelector("#invoice");
  if (invoice) {
    html2canvas(invoice, { scale: 2 }).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("portrait", "px", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Invoice-${InvoiceNo}.pdf`);
    });
  }
};

const Invoice = () => {
  const { orderId } = useParams();
  const [orderDetails, setOrderDetails] = React.useState(null);
  const [rate, setRate] = React.useState(null);

  useEffect(() => {
    const fetchRate = async () => {
      try {
        const response = await getlatestAllRatesAPI();
        setRate(response.data[0]);
      } catch (error) {
        console.error("Error fetching rates:", error);
      }
    };
    fetchRate();
  }, []);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        const response = await getOrderdetailsByOrderIdAPI(orderId);
        setOrderDetails(response.data);
      } catch (error) {
        console.error("Error fetching order details:", error);
      }
    };
    fetchOrderDetails();
  }, [orderId]);

  if (!orderDetails || !rate) {
    return <p>Loading...</p>;
  }

  const { orderDetails: orderInfo, items } = orderDetails;

  // Calculate order totals
  const orderSubtotal = items.reduce((sum, item) => {
    const basePrice =
      item.productType === "gold"
        ? item.weight * rate.Gold
        : item.weight * rate.Silver;

    const makingCharges =
      item.productType === "gold"
        ? basePrice * (item.makingCharges / 100)
        : item.weight * item.makingCharges;

    return sum + basePrice + makingCharges;
  }, 0);

  const orderGst = orderSubtotal * 0.03;
  const orderTotal = orderSubtotal + orderGst;
  const orderDiscount = orderInfo.discount

  const InvoiceNo =
    orderDetails?.invoices && orderDetails.invoices.length > 0
      ? orderDetails.invoices[0].invoice_number
      : orderInfo.orderId || "N/A";

  const downloadPDF = () => {
    const invoice = document.getElementById("invoice");
    html2canvas(invoice, { scale: 2 }).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("portrait", "px", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Invoice-${InvoiceNo}.pdf`);
    });
  };


  return (
    <div>
      <div
        style={{ marginTop: "20px", marginBottom: "20px", textAlign: "center" }}
      >
        <button
          className="btn btn-info"
          onClick={downloadPDF}
          style={{ marginRight: "10px" }}
        >
          Download as PDF
        </button>
        <Link
          to={"/orders"}
          style={{ textDecoration: "none", marginLeft: "45%" }}
        >
          <span className="text-danger">Back</span>
        </Link>
      </div>

      <div className="invoice-container " id="invoice">
        <div className="headerInvoice mb-100">
          <div className="logo-section">
            <img
              src={logo}
              alt="Gajraj Jewellers Logo"
              className="logoInvoice"
            />
          </div>
          <div className="details-section" style={{ lineHeight: "1em" }}>
            <p className="tagline">स्वप्नातील सौंदर्याचा सोनेरी स्पर्श</p>
            <p className="tagline">29 वर्ष आनंदोत्सवाचे साहचर्य</p>
            <p className="address">
              रमानंद कॉम्प्लेक्स, जनसेवा शेजारी हडपसर, पुणे - २८
            </p>
            <p className="contact">Contact: +91 98500 00260</p>
            <p className="pan">PAN: AAEFG8738K | GSTIN: 27AAEFG8738K1ZW</p>
          </div>
          <div
            className="bank-details"
            style={{
              lineHeight: "0.5em",
              textAlign: "center",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <h6>Bank Details</h6>
            <p>Bank Name: ICICI Bank</p>
            <p>A/C No.: 336205000142</p>
            <p>Branch: Hadapsar</p>
            <p>IFSC Code: ICIC0003362</p>
          </div>
        </div>

        <h2 className="tax-invoice m-2">TAX INVOICE</h2>

        <div
          className="invoice-info m-2"
          style={{
            lineHeight: "1em",
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <div className="customer-info">
            <p>
              <strong>Name:</strong> {orderInfo.customerInfo.name}
            </p>
            <p>
              <strong>Email:</strong> {orderInfo.customerInfo.email}
            </p>
            <p>
              <strong>Phone:</strong> {orderInfo.customerInfo.phone}
            </p>
            <p>
              <strong>Address:</strong>{" "}
              {`${orderInfo.shippingAddress.line1}, ${orderInfo.shippingAddress.line2}, ${orderInfo.shippingAddress.city}`}
            </p>
            <p>{`${orderInfo.shippingAddress.state}, ${orderInfo.shippingAddress.country}, ${orderInfo.shippingAddress.pincode}`}</p>
          </div>
          <div className="invoice-details">
            <p>
              <strong>Invoice No:</strong> {InvoiceNo}
            </p>
            <p>
              <strong>Date:</strong>{" "}
              {new Date(orderInfo.orderDate).toLocaleDateString()}
            </p>
          </div>
        </div>

        <table className="product-table">
          <thead>
            <tr>
              <th>Sr.</th>
              <th>Product Name</th>
              <th>HSN</th>
              <th>Pcs</th>
              <th>Net Weight</th>
              <th>Rate /Gm</th>
              <th>Making Charges </th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => {
              const basePrice =
                item.productType === "gold"
                  ? item.weight * rate.Gold
                  : item.weight * rate.Silver;

              const makingCharges =
                item.productType === "gold"
                  ? basePrice * (item.makingCharges / 100)
                  : item.weight * item.makingCharges;

              const subtotal = basePrice + makingCharges;
              const gst = subtotal * 0.03;
              const totalCost = subtotal + gst;

              return (
                <tr key={item.productId}>
                  <td>{index + 1}</td>
                  <td>{item.productName}</td>
                  <td>{item.HSN}</td>
                  <td>{item.quantity}</td>
                  <td>{item.weight}</td>
                  <td>
                    ₹{item.productType === "gold" ? rate.Gold : rate.Silver}
                  </td>
                  <td>
                    {item.productType === "gold"
                      ? `${item.makingCharges}%`
                      : `₹${item.makingCharges}/g`}
                  </td>
                  <td>₹{subtotal.toFixed(2)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <table
          className="totals-table"
          style={{ width: "300px", marginLeft: "auto", marginTop: "20px" }}
        >
          <tbody>
            <tr>
              <td>
                <strong>Subtotal</strong>
              </td>
              <td className="text-end">₹{orderSubtotal.toFixed(2)}</td>
            </tr>
            <tr>
              <td colSpan="2">
                <hr style={{ margin: "10px 0", border: "1px solid #000" }} />
              </td>
            </tr>
            <tr>
              <td>
                <strong>GST (3%)</strong>
              </td>
              <td className="text-end">₹{orderGst.toFixed(2)}</td>
            </tr>
            <tr className='grand-total'>
              <td>
                <strong>Discount</strong>
              </td>
              <td className='text-end'>- ₹{orderDiscount.toFixed(2)}</td>
            </tr>
            <tr>
              <td colSpan="2">
                <hr style={{ margin: "10px 0", border: "1px solid #000" }} />
              </td>
            </tr>
            <tr className="grand-total">
              <td>
                <strong>Grand Total</strong>
              </td>
              <td className="text-end">₹{orderTotal.toFixed(2)}</td>
            </tr>
          </tbody>
        </table>

        <div className="footer">
          <div className="row" style={{ marginTop: "90px" }}>
            <div className="col-6">
              <p className="signature">
                <b>Customer&apos;s Sign</b>
              </p>
            </div>
            <div className="col-6 text-end">
              <p className="signature">
                <b>Authorized Signatory</b>
              </p>
            </div>
          </div>

          <div className="terms-section">
            <p className="terms">
              Kindly check your GST TIN Number. We will not be responsible for
              disallowance of input tax credit in case of wrong or NO GSTTIN
              Number. The consumer can mark jewelry artifacts verified from any
              BIS recognized A&H Centre.
            </p>
            <p className="terms-marathi">
              कृपया तुमचा GST TIN नंबर तपासा. चुकीच्या किंवा GST TIN नंबर
              नसल्यास इनपुट टॅक्स क्रेडिटच्या नामंजुरीस आम्ही जबाबदार राहणार
              नाही.
            </p>
            <p className="additional-info">
              • All disputes are subject to Pune jurisdiction • This is a
              computer generated invoice • Thank you for your business!
            </p>
          </div>
        </div>
      </div>
      <div
        style={{ marginTop: "20px", marginBottom: "20px", textAlign: "center" }}
      >
        &nbsp;
      </div>
    </div>
  );
};

export default Invoice;
