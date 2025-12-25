"use client";

import React, { useState, useEffect } from "react";
import {
    Database,
    Table as TableIcon,
    Trash2,
    RefreshCcw,
    Search,
    ChevronRight,
    DatabaseZap,
    Filter,
    Download,
    Plus
} from "lucide-react";
import { cn } from "@/lib/utils";

interface DBTable {
    id: string;
    name: string;
    count: number;
}

export default function DatabaseExplorer() {
    const [tables, setTables] = useState<DBTable[]>([]);
    const [selectedTable, setSelectedTable] = useState<string | null>(null);
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [tableLoading, setTableLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchTables();
    }, []);

    useEffect(() => {
        if (selectedTable) {
            fetchTableData(selectedTable);
        }
    }, [selectedTable]);

    const fetchTables = async () => {
        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                setError("Вы не авторизованы. Пожалуйста, войдите в систему.");
                setTables([]);
                return;
            }
            const res = await fetch("/api/admin/db", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            const json = await res.json();
            if (!res.ok) {
                setError(json.error || "Ошибка доступа. Требуются права администратора.");
                setTables([]);
                return;
            }
            if (Array.isArray(json)) {
                setTables(json);
            } else {
                setError("Неверный формат данных от сервера");
                setTables([]);
            }
        } catch (err) {
            console.error("Failed to fetch tables", err);
            setError("Ошибка подключения к серверу");
            setTables([]);
        } finally {
            setLoading(false);
        }
    };


    const fetchTableData = async (tableId: string) => {
        setTableLoading(true);
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`/api/admin/db?table=${tableId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            if (!res.ok) {
                console.error(`API error: ${res.status} ${res.statusText}`);
                const text = await res.text();
                try {
                    const json = JSON.parse(text);
                    console.error("API error details:", json);
                } catch (e) {
                    console.error("API error text:", text);
                }
                setData([]);
                return;
            }

            const json = await res.json();
            if (Array.isArray(json)) {
                setData(json);
            } else {
                console.error("API returned non-array data:", json);
                setData([]);
            }
        } catch (err) {
            console.error("Failed to fetch table data", err);
            setData([]);
        } finally {
            setTableLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Вы уверены, что хотите удалить эту запись?")) return;

        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`/api/admin/db?table=${selectedTable}&id=${id}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            if (res.ok) {
                setData(data.filter((item) => item.id !== id));
                fetchTables(); // Обновляем счетчик
            }
        } catch (err) {
            alert("Ошибка при удалении");
        }
    };

    const filteredData = data.filter((item) =>
        Object.values(item).some((v) =>
            String(v).toLowerCase().includes(searchTerm.toLowerCase())
        )
    );

    const getTableColumns = () => {
        if (data.length === 0) return [];
        return Object.keys(data[0]);
    };

    return (
        <div className="flex h-screen bg-[#f8fafc] dark:bg-[#020617] text-slate-900 dark:text-slate-100 overflow-hidden font-sans">
            {/* Sidebar */}
            <div className="w-72 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col pt-6">
                <div className="px-6 mb-8 flex items-center gap-3">
                    <div className="p-2 bg-blue-600 rounded-lg shadow-lg shadow-blue-500/30">
                        <DatabaseZap className="text-white h-5 w-5" />
                    </div>
                    <div>
                        <h1 className="font-bold text-lg tracking-tight">DB Explorer</h1>
                        <p className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold">Management Console</p>
                    </div>
                </div>

                <div className="px-4 mb-4">
                    <p className="px-2 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Models</p>
                    <div className="space-y-1">
                        {loading ? (
                            [1, 2, 3, 4, 5].map((i) => (
                                <div key={i} className="h-10 bg-slate-100 dark:bg-slate-800 animate-pulse rounded-md" />
                            ))
                        ) : error ? (
                            <div className="p-4 text-center">
                                <p className="text-red-500 text-sm">{error}</p>
                                <button
                                    onClick={fetchTables}
                                    className="mt-2 text-blue-500 text-xs hover:underline"
                                >
                                    Повторить
                                </button>
                            </div>
                        ) : tables.length === 0 ? (
                            <p className="text-slate-400 text-sm p-4 text-center">Нет данных</p>
                        ) : (
                            tables.map((table) => (
                                <button
                                    key={table.id}
                                    onClick={() => setSelectedTable(table.id)}
                                    className={cn(
                                        "w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all duration-200 group text-sm font-medium",
                                        selectedTable === table.id
                                            ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                                            : "hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-500 dark:text-slate-400"
                                    )}
                                >
                                    <div className="flex items-center gap-3">
                                        <TableIcon className={cn("h-4 w-4", selectedTable === table.id ? "text-blue-500" : "text-slate-400")} />
                                        <span>{table.name}</span>
                                    </div>
                                    <span className={cn(
                                        "text-[10px] px-2 py-0.5 rounded-full font-bold",
                                        selectedTable === table.id
                                            ? "bg-blue-100 dark:bg-blue-900/40"
                                            : "bg-slate-100 dark:bg-slate-800"
                                    )}>
                                        {table.count}
                                    </span>
                                </button>
                            ))

                        )}
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Header */}
                <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-8">
                    <div className="flex items-center gap-4 flex-1 max-w-xl">
                        <div className="relative w-full">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Поиск по записям..."
                                className="w-full pl-10 pr-4 py-2 bg-slate-100 dark:bg-slate-800/50 border-none rounded-full text-sm focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                            <RefreshCcw className="h-5 w-5" onClick={() => selectedTable && fetchTableData(selectedTable)} />
                        </button>
                        <div className="h-6 w-[1px] bg-slate-200 dark:bg-slate-800 mx-2" />
                        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-all shadow-md shadow-blue-500/20 active:scale-95">
                            <Plus className="h-4 w-4" />
                            Добавить
                        </button>
                    </div>
                </header>

                {/* Content Area */}
                <main className="flex-1 overflow-auto p-8">
                    {!selectedTable ? (
                        <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
                            <Database className="h-24 w-24 mb-6 text-slate-300" />
                            <h2 className="text-2xl font-bold">Выберите таблицу</h2>
                            <p className="text-slate-500 max-w-sm mt-2">
                                Для просмотра и управления данными выберите соответствующую модель в боковой панели.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="flex items-center gap-2 text-slate-400 text-sm mb-1 uppercase tracking-tight font-medium">
                                        <span>Database</span>
                                        <ChevronRight className="h-3 w-3" />
                                        <span className="text-blue-500">{selectedTable}</span>
                                    </div>
                                    <h2 className="text-3xl font-extrabold tracking-tight">
                                        {tables.find(t => t.id === selectedTable)?.name}
                                    </h2>
                                </div>
                                <div className="flex gap-2">
                                    <button className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-semibold hover:bg-slate-50 transition-colors">
                                        <Filter className="h-3 w-3" /> Фильтр
                                    </button>
                                    <button className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-semibold hover:bg-slate-50 transition-colors">
                                        <Download className="h-3 w-3" /> Экспорт
                                    </button>
                                </div>
                            </div>

                            {/* Data Table */}
                            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="bg-slate-50/50 dark:bg-slate-800/30 border-b border-slate-200 dark:border-slate-800">
                                                {getTableColumns().map((col) => (
                                                    <th key={col} className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                                                        {col}
                                                    </th>
                                                ))}
                                                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest text-right">
                                                    Actions
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                            {tableLoading ? (
                                                [1, 2, 3, 4, 5].map((i) => (
                                                    <tr key={i} className="animate-pulse">
                                                        {getTableColumns().map((c) => (
                                                            <td key={c} className="px-6 py-4">
                                                                <div className="h-3 w-20 bg-slate-100 dark:bg-slate-800 rounded" />
                                                            </td>
                                                        ))}
                                                        <td className="px-6 py-4"><div className="h-3 w-8 bg-slate-100 dark:bg-slate-800 rounded ml-auto" /></td>
                                                    </tr>
                                                ))
                                            ) : filteredData.length === 0 ? (
                                                <tr>
                                                    <td colSpan={getTableColumns().length + 1} className="px-6 py-12 text-center text-slate-400 italic">
                                                        Нет данных для отображения
                                                    </td>
                                                </tr>
                                            ) : (
                                                filteredData.map((row, idx) => (
                                                    <tr key={idx} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-colors group">
                                                        {getTableColumns().map((col) => (
                                                            <td key={col} className="px-6 py-4 text-sm font-medium whitespace-nowrap overflow-hidden text-ellipsis max-w-xs">
                                                                {typeof row[col] === 'object' ? (
                                                                    <span className="text-[10px] px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 text-slate-500">
                                                                        {JSON.stringify(row[col])}
                                                                    </span>
                                                                ) : (
                                                                    String(row[col])
                                                                )}
                                                            </td>
                                                        ))}
                                                        <td className="px-6 py-4 text-right">
                                                            <button
                                                                onClick={() => handleDelete(row.id)}
                                                                className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}
