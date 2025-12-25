"use client";
import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth-context";
import {
    CreditCard,
    Calendar,
    User,
    CheckCircle,
    XCircle,
    Clock,
    Download,
    Filter,
    Search,
    Plus,
    Edit3,
    Trash2,
    Star,
    X
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Payment {
    id: string;
    appointmentId: string;
    doctorName: string;
    specialty: string;
    date: string;
    amount: number;
    status: "completed" | "pending" | "failed" | "refunded";
    paymentMethod: "card" | "cash" | "insurance";
    transactionId: string;
    clinic: string;
    description: string;
}

interface PaymentMethod {
    id: string;
    type: "card" | "insurance";
    name: string;
    number: string;
    isDefault: boolean;
}

const mockPayments: Payment[] = [
    {
        id: "1",
        appointmentId: "app_1",
        doctorName: "Доктор Иванов А.И.",
        specialty: "Терапевт",
        date: "2024-11-01",
        amount: 8000,
        status: "completed",
        paymentMethod: "card",
        transactionId: "TXN_001",
        clinic: "Медицинский центр \"Здоровье\"",
        description: "Консультация терапевта"
    },
    {
        id: "2",
        appointmentId: "app_2",
        doctorName: "Доктор Петрова М.С.",
        specialty: "Кардиолог",
        date: "2024-10-28",
        amount: 12000,
        status: "completed",
        paymentMethod: "insurance",
        transactionId: "TXN_002",
        clinic: "Кардиологический центр",
        description: "Кардиологическое обследование"
    },
    {
        id: "3",
        appointmentId: "app_3",
        doctorName: "Доктор Сидоров В.П.",
        specialty: "Невролог",
        date: "2024-10-15",
        amount: 10000,
        status: "pending",
        paymentMethod: "card",
        transactionId: "TXN_003",
        clinic: "Неврологическая клиника",
        description: "Неврологическая консультация"
    },
    {
        id: "4",
        appointmentId: "app_4",
        doctorName: "Доктор Казымова А.Б.",
        specialty: "Дерматолог",
        date: "2024-09-20",
        amount: 9000,
        status: "refunded",
        paymentMethod: "card",
        transactionId: "TXN_004",
        clinic: "Клиника красоты и здоровья",
        description: "Дерматологическая консультация"
    },
    {
        id: "5",
        appointmentId: "app_5",
        doctorName: "Доктор Омаров Т.К.",
        specialty: "Ортопед",
        date: "2024-09-10",
        amount: 11000,
        status: "failed",
        paymentMethod: "card",
        transactionId: "TXN_005",
        clinic: "Центр травматологии",
        description: "Ортопедическая консультация"
    }
];

const mockPaymentMethods: PaymentMethod[] = [
    {
        id: "1",
        type: "card",
        name: "Visa",
        number: "**** **** **** 1234",
        isDefault: true
    },
    {
        id: "2",
        type: "card",
        name: "Mastercard",
        number: "**** **** **** 5678",
        isDefault: false
    },
    {
        id: "3",
        type: "insurance",
        name: "Медицинская страховка",
        number: "INS-123456789",
        isDefault: false
    }
];

const statusColors = {
    completed: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400",
    pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400",
    failed: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400",
    refunded: "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400",
};

const statusLabels = {
    completed: "Оплачено",
    pending: "В обработке",
    failed: "Ошибка",
    refunded: "Возврат",
};

const statusIcons = {
    completed: CheckCircle,
    pending: Clock,
    failed: XCircle,
    refunded: CheckCircle,
};

const paymentMethodLabels = {
    card: "Карта",
    cash: "Наличные",
    insurance: "Страховка",
};

export const PaymentsTab = () => {
    const { user } = useAuth();
    const [payments, setPayments] = useState<Payment[]>([]);
    const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>(mockPaymentMethods);
    const [filter, setFilter] = useState<"all" | "completed" | "pending" | "failed" | "refunded">("all");
    const [searchTerm, setSearchTerm] = useState("");
    const [activeSection, setActiveSection] = useState<"history" | "methods">("history");
    const [showAddMethod, setShowAddMethod] = useState(false);
    const [editingMethod, setEditingMethod] = useState<PaymentMethod | null>(null);
    const [previewReceipt, setPreviewReceipt] = useState<Payment | null>(null);
    const [showPayModal, setShowPayModal] = useState(false);
    const [selectedPaymentForPay, setSelectedPaymentForPay] = useState<Payment | null>(null);
    const [selectedMethodId, setSelectedMethodId] = useState<string>("");
    const [newMethod, setNewMethod] = useState({
        type: "card" as "card" | "insurance",
        name: "",
        number: "",
        expiryDate: "",
        cvv: "",
        holderName: ""
    });

    const handlePayClick = (payment: Payment) => {
        setSelectedPaymentForPay(payment);
        // Select default method if available
        const defaultMethod = paymentMethods.find(m => m.isDefault);
        if (defaultMethod) {
            setSelectedMethodId(defaultMethod.id);
        } else if (paymentMethods.length > 0) {
            setSelectedMethodId(paymentMethods[0].id);
        }
        setShowPayModal(true);
    };

    const handleProcessPayment = async () => {
        if (!selectedPaymentForPay || !selectedMethodId) return;

        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/payments/pay', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    paymentId: selectedPaymentForPay.id,
                    paymentMethodId: selectedMethodId
                })
            });

            if (res.ok) {
                alert("Оплата прошла успешно!");
                setShowPayModal(false);
                setSelectedPaymentForPay(null);
                // Refresh payments
                const fetchPayments = async () => {
                    try {
                        const token = localStorage.getItem('token');
                        const res = await fetch('/api/payments', {
                            headers: { 'Authorization': `Bearer ${token}` }
                        });
                        if (res.ok) {
                            setPayments(await res.json());
                        }
                    } catch (error) { console.error(error); }
                };
                fetchPayments();
            } else {
                alert("Ошибка оплаты");
            }
        } catch (error) {
            console.error("Payment failed", error);
            alert("Ошибка сети");
        }
    };

    // Загрузка платежей из API
    useEffect(() => {
        const fetchPayments = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await fetch('/api/payments', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    setPayments(data);
                }
            } catch (error) {
                console.error("Failed to load payments", error);
            }
        };

        if (user) {
            fetchPayments();
        }
    }, [user]);

    // Загрузка способов оплаты из API
    const fetchPaymentMethods = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/payment-methods', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                setPaymentMethods(await res.json());
            }
        } catch (error) {
            console.error("Failed to load payment methods", error);
        }
    };

    useEffect(() => {
        if (user) {
            fetchPaymentMethods();
        }
    }, [user]);

    // Удалена функция savePaymentMethods, так как API делает это напрямую


    // Input Masking Helpers
    const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let value = e.target.value.replace(/\D/g, "");
        if (value.length > 16) value = value.slice(0, 16);
        const formatted = value.replace(/(\d{4})(?=\d)/g, "$1 ");
        setNewMethod({ ...newMethod, number: formatted });
    };

    const handleExpiryDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let value = e.target.value.replace(/\D/g, "");
        if (value.length > 4) value = value.slice(0, 4);
        if (value.length >= 2) {
            value = value.slice(0, 2) + "/" + value.slice(2);
        }
        setNewMethod({ ...newMethod, expiryDate: value });
    };

    const handleCVVChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let value = e.target.value.replace(/\D/g, "");
        if (value.length > 3) value = value.slice(0, 3);
        setNewMethod({ ...newMethod, cvv: value });
    };

    const handleHolderNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let value = e.target.value.toUpperCase();
        setNewMethod({ ...newMethod, holderName: value });
    };

    // Добавление нового способа оплаты
    const handleAddMethod = async () => {
        if (!newMethod.name || !newMethod.number) return;

        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/payment-methods', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    type: newMethod.type,
                    name: newMethod.name,
                    number: newMethod.type === "card"
                        ? `**** **** **** ${newMethod.number.slice(-4)}` // Simplified check for now
                        : newMethod.number,
                    isDefault: paymentMethods.length === 0
                })
            });

            if (res.ok) {
                fetchPaymentMethods();
            }
        } catch (error) {
            console.error("Failed to add payment method", error);
        }

        // Сброс формы
        setNewMethod({
            type: "card",
            name: "",
            number: "",
            expiryDate: "",
            cvv: "",
            holderName: ""
        });
        setShowAddMethod(false);
    };

    // Удаление способа оплаты
    const handleDeleteMethod = async (methodId: string) => {
        if (!confirm('Вы уверены?')) return;
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`/api/payment-methods?id=${methodId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                fetchPaymentMethods();
            }
        } catch (error) {
            console.error("Failed to delete payment method", error);
        }
    };

    // Установка способа оплаты по умолчанию
    // Установка способа оплаты по умолчанию
    const handleSetDefault = async (methodId: string) => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/payment-methods', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ id: methodId, isDefault: true })
            });
            if (res.ok) {
                fetchPaymentMethods();
            }
        } catch (error) {
            console.error("Failed to set default payment method", error);
        }
    };

    // Редактирование способа оплаты
    const handleEditMethod = (method: PaymentMethod) => {
        setEditingMethod(method);
        setNewMethod({
            type: method.type,
            name: method.name,
            number: method.number.replace(/\*/g, "").replace(/\s/g, ""),
            expiryDate: "",
            cvv: "",
            holderName: ""
        });
        setShowAddMethod(true);
    };

    // Сохранение изменений способа оплаты
    // Сохранение изменений способа оплаты
    const handleUpdateMethod = async () => {
        if (!editingMethod || !newMethod.name || !newMethod.number) return;

        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/payment-methods', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    id: editingMethod.id,
                    name: newMethod.name,
                    number: newMethod.type === "card"
                        ? `**** **** **** ${newMethod.number.slice(-4)}`
                        : newMethod.number,
                    type: newMethod.type
                })
            });

            if (res.ok) {
                fetchPaymentMethods();
                // Сброс состояния
                setEditingMethod(null);
                setNewMethod({
                    type: "card",
                    name: "",
                    number: "",
                    expiryDate: "",
                    cvv: "",
                    holderName: ""
                });
                setShowAddMethod(false);
            } else {
                alert("Ошибка при сохранении");
            }
        } catch (error) {
            console.error("Failed to update payment method", error);
            alert("Ошибка сети");
        }
    };

    const filteredPayments = payments.filter((payment) => {
        const matchesFilter = filter === "all" || payment.status === filter;
        const matchesSearch =
            payment.doctorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            payment.specialty.toLowerCase().includes(searchTerm.toLowerCase()) ||
            payment.clinic.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    const totalAmount = payments
        .filter(p => p.status === "completed")
        .reduce((sum, payment) => sum + payment.amount, 0);

    const monthlyAmount = payments
        .filter(p => {
            const paymentDate = new Date(p.date);
            const currentMonth = new Date();
            return p.status === "completed" &&
                paymentDate.getMonth() === currentMonth.getMonth() &&
                paymentDate.getFullYear() === currentMonth.getFullYear();
        })
        .reduce((sum, payment) => sum + payment.amount, 0);

    const handleDownloadReceipt = (paymentId: string) => {
        const payment = payments.find(p => p.id === paymentId);
        if (!payment) return;

        generateReceipt(payment);
    };

    const generateReceipt = (payment: Payment) => {
        // Создаем HTML для чека
        const receiptHTML = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>Чек об оплате</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        max-width: 600px;
                        margin: 0 auto;
                        padding: 20px;
                        line-height: 1.6;
                        color: #333;
                    }
                    .header {
                        text-align: center;
                        border-bottom: 2px solid #2563eb;
                        padding-bottom: 20px;
                        margin-bottom: 30px;
                    }
                    .logo {
                        font-size: 24px;
                        font-weight: bold;
                        color: #2563eb;
                        margin-bottom: 10px;
                    }
                    .receipt-title {
                        font-size: 20px;
                        font-weight: bold;
                        margin-bottom: 5px;
                    }
                    .receipt-number {
                        color: #666;
                        font-size: 14px;
                    }
                    .section {
                        margin-bottom: 25px;
                    }
                    .section-title {
                        font-size: 16px;
                        font-weight: bold;
                        color: #2563eb;
                        margin-bottom: 10px;
                        border-bottom: 1px solid #e5e7eb;
                        padding-bottom: 5px;
                    }
                    .info-row {
                        display: flex;
                        justify-content: space-between;
                        margin-bottom: 8px;
                        padding: 5px 0;
                    }
                    .info-label {
                        font-weight: 500;
                        color: #666;
                    }
                    .info-value {
                        font-weight: 600;
                        text-align: right;
                    }
                    .total {
                        background-color: #f3f4f6;
                        padding: 15px;
                        border-radius: 8px;
                        margin-top: 20px;
                    }
                    .total-amount {
                        font-size: 24px;
                        font-weight: bold;
                        color: #2563eb;
                    }
                    .status {
                        display: inline-block;
                        padding: 4px 12px;
                        border-radius: 20px;
                        font-size: 12px;
                        font-weight: 600;
                        text-transform: uppercase;
                    }
                    .status-completed {
                        background-color: #dcfce7;
                        color: #166534;
                    }
                    .footer {
                        margin-top: 40px;
                        padding-top: 20px;
                        border-top: 1px solid #e5e7eb;
                        text-align: center;
                        color: #666;
                        font-size: 12px;
                    }
                    .qr-placeholder {
                        width: 80px;
                        height: 80px;
                        background-color: #f3f4f6;
                        border: 2px dashed #d1d5db;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        margin: 0 auto;
                        font-size: 10px;
                        color: #666;
                    }
                    @media print {
                        body { margin: 0; padding: 15px; }
                        .no-print { display: none; }
                    }
                </style>
            </head>
            <body>
                <div class="header">
                    <div class="logo">DOQ</div>
                    <div class="receipt-title">Чек об оплате медицинских услуг</div>
                    <div class="receipt-number">№ ${payment.transactionId}</div>
                </div>

                <div class="section">
                    <div class="section-title">Информация о платеже</div>
                    <div class="info-row">
                        <span class="info-label">Дата и время:</span>
                        <span class="info-value">${new Date(payment.date).toLocaleDateString("ru-RU", {
            year: "numeric",
            month: "long",
            day: "numeric"
        })}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">ID транзакции:</span>
                        <span class="info-value">${payment.transactionId}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Статус:</span>
                        <span class="info-value">
                            <span class="status status-completed">Оплачено</span>
                        </span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Способ оплаты:</span>
                        <span class="info-value">${paymentMethodLabels[payment.paymentMethod]}</span>
                    </div>
                </div>

                <div class="section">
                    <div class="section-title">Медицинская услуга</div>
                    <div class="info-row">
                        <span class="info-label">Врач:</span>
                        <span class="info-value">${payment.doctorName}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Специальность:</span>
                        <span class="info-value">${payment.specialty}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Клиника:</span>
                        <span class="info-value">${payment.clinic}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Описание:</span>
                        <span class="info-value">${payment.description}</span>
                    </div>
                </div>

                <div class="section">
                    <div class="section-title">Пациент</div>
                    <div class="info-row">
                        <span class="info-label">Имя:</span>
                        <span class="info-value">${user?.name || "Не указано"}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Email:</span>
                        <span class="info-value">${user?.email || "Не указано"}</span>
                    </div>
                </div>

                <div class="total">
                    <div class="info-row">
                        <span class="info-label">Стоимость услуги:</span>
                        <span class="info-value">${payment.amount.toLocaleString()} ₸</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">НДС (12%):</span>
                        <span class="info-value">${Math.round(payment.amount * 0.12).toLocaleString()} ₸</span>
                    </div>
                    <div class="info-row" style="border-top: 1px solid #d1d5db; padding-top: 10px; margin-top: 10px;">
                        <span class="info-label" style="font-size: 18px;">Итого к оплате:</span>
                        <span class="info-value total-amount">${payment.amount.toLocaleString()} ₸</span>
                    </div>
                </div>

                <div class="footer">
                    <div class="qr-placeholder">QR-код</div>
                    <p style="margin-top: 15px;">
                        Чек сформирован автоматически<br>
                        Дата формирования: ${new Date().toLocaleDateString("ru-RU")} ${new Date().toLocaleTimeString("ru-RU")}<br>
                        Система электронного документооборота DOQ
                    </p>
                    <p style="margin-top: 10px; font-size: 10px;">
                        По вопросам обращайтесь: support@doq.kz | +7 (777) 123-45-67
                    </p>
                </div>
            </body>
            </html>
        `;

        // Создаем новое окно для печати
        const printWindow = window.open('', '_blank');
        if (printWindow) {
            printWindow.document.write(receiptHTML);
            printWindow.document.close();

            // Ждем загрузки и запускаем печать
            printWindow.onload = () => {
                setTimeout(() => {
                    printWindow.print();

                    // Закрываем окно после печати (опционально)
                    printWindow.onafterprint = () => {
                        printWindow.close();
                    };
                }, 500);
            };
        } else {
            // Если не удалось открыть окно, скачиваем как HTML файл
            downloadReceiptAsFile(receiptHTML, payment);
        }
    };

    const downloadReceiptAsFile = (html: string, payment: Payment) => {
        const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `receipt_${payment.transactionId}_${payment.date}.html`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    return (
        <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                                <CreditCard className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                                    Платежи
                                </h1>
                                <p className="text-gray-600 dark:text-gray-400">
                                    История платежей и способы оплаты
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <div className="px-6 py-4">
                    <div className="flex space-x-1">
                        <button
                            onClick={() => setActiveSection("history")}
                            className={cn(
                                "flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200",
                                activeSection === "history"
                                    ? "bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                            )}
                        >
                            <Calendar className="h-4 w-4" />
                            <span>История платежей</span>
                        </button>
                        <button
                            onClick={() => setActiveSection("methods")}
                            className={cn(
                                "flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200",
                                activeSection === "methods"
                                    ? "bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                            )}
                        >
                            <CreditCard className="h-4 w-4" />
                            <span>Способы оплаты</span>
                        </button>
                    </div>
                </div>
            </div>

            {activeSection === "history" && (
                <>
                    {/* Statistics */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                            <div className="flex items-center">
                                <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                                    <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                        Всего потрачено
                                    </p>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                        {totalAmount.toLocaleString()} ₸
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                            <div className="flex items-center">
                                <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                                    <Calendar className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                        За этот месяц
                                    </p>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                        {monthlyAmount.toLocaleString()} ₸
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                            <div className="flex items-center">
                                <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                                    <CreditCard className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                        Всего платежей
                                    </p>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                        {payments.length}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Filters and Search */}
                    <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
                        <div className="p-6">
                            <div className="flex flex-col sm:flex-row gap-4">
                                {/* Search */}
                                <div className="relative flex-1">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Поиск по врачу, специальности или клинике..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
                                    />
                                </div>

                                {/* Status Filter */}
                                <div className="flex items-center space-x-2">
                                    <Filter className="h-4 w-4 text-gray-400" />
                                    <div className="flex space-x-2">
                                        {[
                                            { key: "all", label: "Все" },
                                            { key: "completed", label: "Оплачено" },
                                            { key: "pending", label: "В обработке" },
                                            { key: "failed", label: "Ошибка" },
                                            { key: "refunded", label: "Возврат" },
                                        ].map((filterOption) => (
                                            <button
                                                key={filterOption.key}
                                                onClick={() => setFilter(filterOption.key as typeof filter)}
                                                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors duration-200 ${filter === filterOption.key
                                                    ? "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400"
                                                    : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
                                                    }`}
                                            >
                                                {filterOption.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Payments List */}
                    <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                        <div className="p-6">
                            {filteredPayments.length === 0 ? (
                                <div className="text-center py-12">
                                    <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                                        Платежей не найдено
                                    </h3>
                                    <p className="text-gray-600 dark:text-gray-400">
                                        {searchTerm || filter !== "all"
                                            ? "Попробуйте изменить фильтры поиска"
                                            : "У вас пока нет платежей"
                                        }
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {filteredPayments.map((payment) => {
                                        const StatusIcon = statusIcons[payment.status];
                                        return (
                                            <div
                                                key={payment.id}
                                                className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:shadow-md transition-shadow duration-200"
                                            >
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <div className="flex items-center space-x-3 mb-3">
                                                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                                                {payment.doctorName}
                                                            </h3>
                                                            <span
                                                                className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusColors[payment.status]
                                                                    }`}
                                                            >
                                                                <StatusIcon className="h-3 w-3 mr-1" />
                                                                {statusLabels[payment.status]}
                                                            </span>
                                                        </div>

                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                            <div className="space-y-2">
                                                                <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                                                                    <User className="h-4 w-4" />
                                                                    <span>{payment.specialty}</span>
                                                                </div>
                                                                <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                                                                    <Calendar className="h-4 w-4" />
                                                                    <span>
                                                                        {new Date(payment.date).toLocaleDateString("ru-RU")}
                                                                    </span>
                                                                </div>
                                                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                                                    <span className="font-medium">Клиника:</span> {payment.clinic}
                                                                </div>
                                                            </div>

                                                            <div className="space-y-2">
                                                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                                                    <span className="font-medium">Способ оплаты:</span>{" "}
                                                                    {paymentMethodLabels[payment.paymentMethod]}
                                                                </div>
                                                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                                                    <span className="font-medium">ID транзакции:</span>{" "}
                                                                    {payment.transactionId}
                                                                </div>
                                                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                                                    <span className="font-medium">Описание:</span>{" "}
                                                                    {payment.description}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="text-right ml-4">
                                                        <div className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                                                            {payment.amount.toLocaleString()} ₸
                                                        </div>
                                                        {payment.status === "completed" && (
                                                            <div className="flex space-x-2">
                                                                <button
                                                                    onClick={() => setPreviewReceipt(payment)}
                                                                    className="inline-flex items-center space-x-1 px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-300 rounded-lg transition-colors duration-200"
                                                                >
                                                                    <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                                    </svg>
                                                                    <span>Просмотр</span>
                                                                </button>
                                                                <button
                                                                    onClick={() => handleDownloadReceipt(payment.id)}
                                                                    className="inline-flex items-center space-x-1 px-3 py-1 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200"
                                                                >
                                                                    <Download className="h-3 w-3" />
                                                                    <span>Скачать</span>
                                                                </button>
                                                            </div>
                                                        )}
                                                        {payment.status === "pending" && (
                                                            <button
                                                                onClick={() => handlePayClick(payment)}
                                                                className="inline-flex items-center space-x-1 px-4 py-2 text-sm bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors duration-200 shadow-sm"
                                                            >
                                                                <CreditCard className="h-4 w-4" />
                                                                <span>Оплатить</span>
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )}

            {activeSection === "methods" && (
                <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                    <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                Способы оплаты
                            </h3>
                            <button
                                onClick={() => {
                                    setEditingMethod(null);
                                    setNewMethod({
                                        type: "card",
                                        name: "",
                                        number: "",
                                        expiryDate: "",
                                        cvv: "",
                                        holderName: ""
                                    });
                                    setShowAddMethod(true);
                                }}
                                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200"
                            >
                                <Plus className="h-4 w-4" />
                                <span>Добавить способ</span>
                            </button>
                        </div>
                    </div>

                    <div className="p-6">
                        {paymentMethods.length === 0 ? (
                            <div className="text-center py-12">
                                <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                                    Нет способов оплаты
                                </h3>
                                <p className="text-gray-600 dark:text-gray-400 mb-6">
                                    Добавьте карту или страховку для удобной оплаты
                                </p>
                                <button
                                    onClick={() => setShowAddMethod(true)}
                                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200"
                                >
                                    Добавить способ оплаты
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {paymentMethods.map((method) => (
                                    <div
                                        key={method.id}
                                        className={`border rounded-lg p-4 relative ${method.isDefault
                                            ? "border-blue-500 bg-blue-50 dark:bg-blue-900/10"
                                            : "border-gray-200 dark:border-gray-700"
                                            }`}
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-center space-x-3 flex-1">
                                                <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
                                                    <CreditCard className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                                                </div>
                                                <div className="flex-1">
                                                    <h4 className="font-medium text-gray-900 dark:text-white">
                                                        {method.name}
                                                    </h4>
                                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                                        {method.number}
                                                    </p>
                                                    {method.isDefault && (
                                                        <span className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400 text-xs rounded-full mt-2">
                                                            <Star className="h-3 w-3 mr-1" />
                                                            По умолчанию
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Действия */}
                                            <div className="flex items-center space-x-2">
                                                {!method.isDefault && (
                                                    <button
                                                        onClick={() => handleSetDefault(method.id)}
                                                        className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                                        title="Сделать основным"
                                                    >
                                                        <Star className="h-4 w-4" />
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => handleEditMethod(method)}
                                                    className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                                    title="Редактировать"
                                                >
                                                    <Edit3 className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteMethod(method.id)}
                                                    className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                                    title="Удалить"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Модальное окно добавления/редактирования способа оплаты */}
            {showAddMethod && (
                <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4 z-50">
                    <div className="bg-white dark:bg-gray-900 rounded-xl max-w-md w-full">
                        <div className="p-4 border-b border-gray-100 dark:border-gray-800">
                            <div className="flex items-center justify-between">
                                <h3 className="text-base font-medium text-gray-900 dark:text-white">
                                    {editingMethod ? "Редактировать способ оплаты" : "Добавить способ оплаты"}
                                </h3>
                                <button
                                    onClick={() => {
                                        setShowAddMethod(false);
                                        setEditingMethod(null);
                                        setNewMethod({
                                            type: "card",
                                            name: "",
                                            number: "",
                                            expiryDate: "",
                                            cvv: "",
                                            holderName: ""
                                        });
                                    }}
                                    className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>
                        </div>

                        <div className="p-4 space-y-4">
                            {/* Тип способа оплаты */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Тип
                                </label>
                                <div className="flex space-x-2">
                                    <button
                                        onClick={() => setNewMethod({ ...newMethod, type: "card" })}
                                        className={`flex-1 px-3 py-2 text-sm rounded-lg border transition-colors ${newMethod.type === "card"
                                            ? "bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-600"
                                            : "bg-gray-50 text-gray-700 border-gray-300 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600"
                                            }`}
                                    >
                                        Банковская карта
                                    </button>
                                    <button
                                        onClick={() => setNewMethod({ ...newMethod, type: "insurance" })}
                                        className={`flex-1 px-3 py-2 text-sm rounded-lg border transition-colors ${newMethod.type === "insurance"
                                            ? "bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-600"
                                            : "bg-gray-50 text-gray-700 border-gray-300 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600"
                                            }`}
                                    >
                                        Страховка
                                    </button>
                                </div>
                            </div>

                            {/* Название */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    {newMethod.type === "card" ? "Название карты" : "Название страховки"}
                                </label>
                                <input
                                    type="text"
                                    value={newMethod.name}
                                    onChange={(e) => setNewMethod({ ...newMethod, name: e.target.value })}
                                    placeholder={newMethod.type === "card" ? "Visa, Mastercard..." : "Медицинская страховка"}
                                    className="w-full px-3 py-2 border-0 bg-gray-50 dark:bg-gray-800 rounded-lg focus:ring-1 focus:ring-blue-500 dark:text-white text-sm"
                                />
                            </div>

                            {/* Номер */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    {newMethod.type === "card" ? "Номер карты" : "Номер полиса"}
                                </label>
                                <input
                                    type="text"
                                    value={newMethod.number}
                                    onChange={newMethod.type === "card" ? handleCardNumberChange : (e) => setNewMethod({ ...newMethod, number: e.target.value })}
                                    placeholder={newMethod.type === "card" ? "0000 0000 0000 0000" : "INS-123456789"}
                                    className="w-full px-3 py-2 border-0 bg-gray-50 dark:bg-gray-800 rounded-lg focus:ring-1 focus:ring-blue-500 dark:text-white text-sm"
                                    maxLength={newMethod.type === "card" ? 19 : undefined}
                                />
                            </div>

                            {/* Дополнительные поля для карты */}
                            {newMethod.type === "card" && (
                                <>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Срок действия
                                            </label>
                                            <input
                                                type="text"
                                                value={newMethod.expiryDate}
                                                onChange={handleExpiryDateChange}
                                                placeholder="MM/YY"
                                                maxLength={5}
                                                className="w-full px-3 py-2 border-0 bg-gray-50 dark:bg-gray-800 rounded-lg focus:ring-1 focus:ring-blue-500 dark:text-white text-sm"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                CVV
                                            </label>
                                            <input
                                                type="text"
                                                value={newMethod.cvv}
                                                onChange={handleCVVChange}
                                                placeholder="123"
                                                maxLength={3}
                                                className="w-full px-3 py-2 border-0 bg-gray-50 dark:bg-gray-800 rounded-lg focus:ring-1 focus:ring-blue-500 dark:text-white text-sm"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Имя держателя
                                        </label>
                                        <input
                                            type="text"
                                            value={newMethod.holderName}
                                            onChange={handleHolderNameChange}
                                            placeholder="IVAN IVANOV"
                                            className="w-full px-3 py-2 border-0 bg-gray-50 dark:bg-gray-800 rounded-lg focus:ring-1 focus:ring-blue-500 dark:text-white text-sm"
                                        />
                                    </div>
                                </>
                            )}
                        </div>

                        <div className="p-4 border-t border-gray-100 dark:border-gray-800 flex justify-end space-x-3">
                            <button
                                onClick={() => {
                                    setShowAddMethod(false);
                                    setEditingMethod(null);
                                    setNewMethod({
                                        type: "card",
                                        name: "",
                                        number: "",
                                        expiryDate: "",
                                        cvv: "",
                                        holderName: ""
                                    });
                                }}
                                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
                            >
                                Отмена
                            </button>
                            <button
                                onClick={editingMethod ? handleUpdateMethod : handleAddMethod}
                                disabled={!newMethod.name || !newMethod.number}
                                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white rounded-lg text-sm font-medium"
                            >
                                {editingMethod ? "Сохранить" : "Добавить"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Модальное окно предпросмотра чека */}
            {previewReceipt && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white dark:bg-gray-900 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-4 border-b border-gray-100 dark:border-gray-800">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                    Предпросмотр чека
                                </h3>
                                <button
                                    onClick={() => setPreviewReceipt(null)}
                                    className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>
                        </div>

                        <div className="p-6">
                            {/* Заголовок чека */}
                            <div className="text-center border-b-2 border-blue-600 pb-4 mb-6">
                                <div className="text-2xl font-bold text-blue-600 mb-2">DOQ</div>
                                <div className="text-lg font-semibold text-gray-900 dark:text-white">
                                    Чек об оплате медицинских услуг
                                </div>
                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                    № {previewReceipt.transactionId}
                                </div>
                            </div>

                            {/* Информация о платеже */}
                            <div className="mb-6">
                                <h4 className="text-base font-semibold text-blue-600 mb-3 border-b border-gray-200 dark:border-gray-700 pb-1">
                                    Информация о платеже
                                </h4>
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600 dark:text-gray-400">Дата:</span>
                                        <span className="font-medium text-gray-900 dark:text-white">
                                            {new Date(previewReceipt.date).toLocaleDateString("ru-RU", {
                                                year: "numeric",
                                                month: "long",
                                                day: "numeric"
                                            })}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600 dark:text-gray-400">ID транзакции:</span>
                                        <span className="font-medium text-gray-900 dark:text-white">
                                            {previewReceipt.transactionId}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600 dark:text-gray-400">Статус:</span>
                                        <span className="inline-flex items-center px-2 py-1 bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 text-xs rounded-full">
                                            <CheckCircle className="h-3 w-3 mr-1" />
                                            Оплачено
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600 dark:text-gray-400">Способ оплаты:</span>
                                        <span className="font-medium text-gray-900 dark:text-white">
                                            {paymentMethodLabels[previewReceipt.paymentMethod]}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Медицинская услуга */}
                            <div className="mb-6">
                                <h4 className="text-base font-semibold text-blue-600 mb-3 border-b border-gray-200 dark:border-gray-700 pb-1">
                                    Медицинская услуга
                                </h4>
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600 dark:text-gray-400">Врач:</span>
                                        <span className="font-medium text-gray-900 dark:text-white">
                                            {previewReceipt.doctorName}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600 dark:text-gray-400">Специальность:</span>
                                        <span className="font-medium text-gray-900 dark:text-white">
                                            {previewReceipt.specialty}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600 dark:text-gray-400">Клиника:</span>
                                        <span className="font-medium text-gray-900 dark:text-white">
                                            {previewReceipt.clinic}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600 dark:text-gray-400">Описание:</span>
                                        <span className="font-medium text-gray-900 dark:text-white">
                                            {previewReceipt.description}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Пациент */}
                            <div className="mb-6">
                                <h4 className="text-base font-semibold text-blue-600 mb-3 border-b border-gray-200 dark:border-gray-700 pb-1">
                                    Пациент
                                </h4>
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600 dark:text-gray-400">Имя:</span>
                                        <span className="font-medium text-gray-900 dark:text-white">
                                            {user?.name || "Не указано"}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600 dark:text-gray-400">Email:</span>
                                        <span className="font-medium text-gray-900 dark:text-white">
                                            {user?.email || "Не указано"}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Итого */}
                            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600 dark:text-gray-400">Стоимость услуги:</span>
                                        <span className="font-medium text-gray-900 dark:text-white">
                                            {previewReceipt.amount.toLocaleString()} ₸
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600 dark:text-gray-400">НДС (12%):</span>
                                        <span className="font-medium text-gray-900 dark:text-white">
                                            {Math.round(previewReceipt.amount * 0.12).toLocaleString()} ₸
                                        </span>
                                    </div>
                                    <div className="flex justify-between border-t border-gray-200 dark:border-gray-700 pt-2 mt-2">
                                        <span className="text-lg font-semibold text-gray-900 dark:text-white">
                                            Итого к оплате:
                                        </span>
                                        <span className="text-xl font-bold text-blue-600 dark:text-blue-400">
                                            {previewReceipt.amount.toLocaleString()} ₸
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Футер */}
                            <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700 text-center text-xs text-gray-500 dark:text-gray-400">
                                <p>Чек сформирован автоматически</p>
                                <p>Дата формирования: {new Date().toLocaleDateString("ru-RU")} {new Date().toLocaleTimeString("ru-RU")}</p>
                                <p className="mt-2">По вопросам обращайтесь: support@doq.kz | +7 (777) 123-45-67</p>
                            </div>
                        </div>

                        <div className="p-4 border-t border-gray-100 dark:border-gray-800 flex justify-end space-x-3">
                            <button
                                onClick={() => setPreviewReceipt(null)}
                                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
                            >
                                Закрыть
                            </button>
                            <button
                                onClick={() => {
                                    handleDownloadReceipt(previewReceipt.id);
                                    setPreviewReceipt(null);
                                }}
                                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium"
                            >
                                <Download className="h-4 w-4" />
                                <span>Скачать чек</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* Modal for Payment Selection */}
            {showPayModal && selectedPaymentForPay && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white dark:bg-gray-900 rounded-xl max-w-md w-full">
                        <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                Оплата услуги
                            </h3>
                            <button onClick={() => setShowPayModal(false)} className="text-gray-400 hover:text-gray-500">
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">К оплате:</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {selectedPaymentForPay.amount.toLocaleString()} ₸
                                </p>
                                <p className="text-sm text-gray-500 mt-1">{selectedPaymentForPay.description}</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Выберите способ оплаты:
                                </label>
                                {paymentMethods.length === 0 ? (
                                    <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                        <p className="text-sm text-gray-500 mb-2">Нет сохраненных карт</p>
                                        <button
                                            onClick={() => { setShowPayModal(false); setActiveSection("methods"); setShowAddMethod(true); }}
                                            className="text-blue-600 text-sm font-medium hover:underline"
                                        >
                                            Добавить карту
                                        </button>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        {paymentMethods.map(method => (
                                            <div
                                                key={method.id}
                                                onClick={() => setSelectedMethodId(method.id)}
                                                className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-colors ${selectedMethodId === method.id
                                                    ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                                                    : "border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                                                    }`}
                                            >
                                                <div className="flex items-center space-x-3">
                                                    <CreditCard className="h-5 w-5 text-gray-400" />
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-900 dark:text-white">{method.name}</p>
                                                        <p className="text-xs text-gray-500">{method.number}</p>
                                                    </div>
                                                </div>
                                                {selectedMethodId === method.id && (
                                                    <div className="h-4 w-4 rounded-full bg-blue-600" />
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="p-4 border-t border-gray-100 dark:border-gray-800 flex justify-end space-x-3">
                            <button
                                onClick={() => setShowPayModal(false)}
                                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
                            >
                                Отмена
                            </button>
                            <button
                                onClick={handleProcessPayment}
                                disabled={!selectedMethodId}
                                className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white rounded-lg text-sm font-medium"
                            >
                                Оплатить {selectedPaymentForPay.amount.toLocaleString()} ₸
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};