"use client";
import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth-context";
import { 
  FileText, 
  Plus, 
  Calendar, 
  User, 
  Stethoscope, 
  Pill, 
  Activity,
  Edit3,
  Trash2,
  Save,
  X
} from "lucide-react";
import { cn } from "@/lib/utils";

interface MedicalRecord {
  id: string;
  date: string;
  doctor: string;
  specialty: string;
  diagnosis: string;
  treatment: string;
  medications: string[];
  notes: string;
  attachments?: string[];
}

interface VitalSigns {
  height: string;
  weight: string;
  bloodPressure: string;
  heartRate: string;
  temperature: string;
  bloodType: string;
}

interface Allergies {
  medications: string[];
  food: string[];
  environmental: string[];
}

interface ChronicConditions {
  conditions: string[];
  medications: string[];
}

export const MedicalRecordsTab = () => {
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState("overview");
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([]);
  const [vitalSigns, setVitalSigns] = useState<VitalSigns>({
    height: "",
    weight: "",
    bloodPressure: "",
    heartRate: "",
    temperature: "",
    bloodType: ""
  });
  const [allergies, setAllergies] = useState<Allergies>({
    medications: [],
    food: [],
    environmental: []
  });
  const [chronicConditions, setChronicConditions] = useState<ChronicConditions>({
    conditions: [],
    medications: []
  });
  const [isEditing, setIsEditing] = useState(false);
  const [showAddRecord, setShowAddRecord] = useState(false);
  const [newRecord, setNewRecord] = useState<Partial<MedicalRecord>>({
    date: new Date().toISOString().split('T')[0],
    doctor: "",
    specialty: "",
    diagnosis: "",
    treatment: "",
    medications: [],
    notes: ""
  });

  // Загрузка данных из localStorage
  useEffect(() => {
    if (user?.email) {
      const savedRecords = localStorage.getItem(`medicalRecords_${user.email}`);
      const savedVitals = localStorage.getItem(`vitalSigns_${user.email}`);
      const savedAllergies = localStorage.getItem(`allergies_${user.email}`);
      const savedConditions = localStorage.getItem(`chronicConditions_${user.email}`);

      if (savedRecords) setMedicalRecords(JSON.parse(savedRecords));
      if (savedVitals) setVitalSigns(JSON.parse(savedVitals));
      if (savedAllergies) setAllergies(JSON.parse(savedAllergies));
      if (savedConditions) setChronicConditions(JSON.parse(savedConditions));
    }
  }, [user?.email]);

  // Сохранение данных в localStorage
  const saveToStorage = (key: string, data: unknown) => {
    if (user?.email) {
      localStorage.setItem(`${key}_${user.email}`, JSON.stringify(data));
    }
  };

  const handleAddRecord = () => {
    if (newRecord.doctor && newRecord.diagnosis) {
      const record: MedicalRecord = {
        id: Date.now().toString(),
        date: newRecord.date || new Date().toISOString().split('T')[0],
        doctor: newRecord.doctor || "",
        specialty: newRecord.specialty || "",
        diagnosis: newRecord.diagnosis || "",
        treatment: newRecord.treatment || "",
        medications: newRecord.medications || [],
        notes: newRecord.notes || ""
      };

      const updatedRecords = [record, ...medicalRecords];
      setMedicalRecords(updatedRecords);
      saveToStorage("medicalRecords", updatedRecords);
      
      setNewRecord({
        date: new Date().toISOString().split('T')[0],
        doctor: "",
        specialty: "",
        diagnosis: "",
        treatment: "",
        medications: [],
        notes: ""
      });
      setShowAddRecord(false);
    }
  };

  const handleDeleteRecord = (id: string) => {
    const updatedRecords = medicalRecords.filter(record => record.id !== id);
    setMedicalRecords(updatedRecords);
    saveToStorage("medicalRecords", updatedRecords);
  };

  const handleSaveVitals = () => {
    saveToStorage("vitalSigns", vitalSigns);
    saveToStorage("allergies", allergies);
    saveToStorage("chronicConditions", chronicConditions);
    setIsEditing(false);
  };

  const sections = [
    { id: "overview", label: "Обзор", icon: Activity },
    { id: "records", label: "Записи врачей", icon: FileText },
    { id: "vitals", label: "Показатели", icon: Stethoscope },
    { id: "medications", label: "Лекарства", icon: Pill }
  ];

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Медицинская карта
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Управляйте своими медицинскими данными
                </p>
              </div>
            </div>
            <button
              onClick={() => isEditing ? handleSaveVitals() : setIsEditing(!isEditing)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200"
            >
              {isEditing ? <Save className="h-4 w-4" /> : <Edit3 className="h-4 w-4" />}
              <span>{isEditing ? "Сохранить" : "Редактировать"}</span>
            </button>
          </div>
        </div>

        {/* Navigation */}
        <div className="px-6 py-4">
          <div className="flex space-x-1">
            {sections.map((section) => {
              const Icon = section.icon;
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={cn(
                    "flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200",
                    activeSection === section.id
                      ? "bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                      : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span>{section.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      {activeSection === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Основные показатели */}
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Основные показатели
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Рост:</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {vitalSigns.height ? `${vitalSigns.height} см` : "Не указано"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Вес:</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {vitalSigns.weight ? `${vitalSigns.weight} кг` : "Не указано"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Группа крови:</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {vitalSigns.bloodType || "Не указано"}
                </span>
              </div>
            </div>
          </div>

          {/* Последние записи */}
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Последние записи
            </h3>
            <div className="space-y-3">
              {medicalRecords.slice(0, 3).map((record) => (
                <div key={record.id} className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {record.diagnosis}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(record.date).toLocaleDateString()} • {record.doctor}
                    </p>
                  </div>
                </div>
              ))}
              {medicalRecords.length === 0 && (
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  Записей пока нет
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {activeSection === "records" && (
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Записи врачей
              </h3>
              <button
                onClick={() => setShowAddRecord(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200"
              >
                <Plus className="h-4 w-4" />
                <span>Добавить запись</span>
              </button>
            </div>
          </div>

          <div className="p-6">
            {medicalRecords.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Записей пока нет
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-6">
                  Добавьте первую запись о посещении врача
                </p>
                <button
                  onClick={() => setShowAddRecord(true)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200"
                >
                  Добавить запись
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {medicalRecords.map((record) => (
                  <div key={record.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                          <User className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white">
                            {record.doctor}
                          </h4>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {record.specialty} • {new Date(record.date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteRecord(record.id)}
                        className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors duration-200"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    
                    <div className="space-y-2">
                      <div>
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Диагноз:</span>
                        <p className="text-sm text-gray-900 dark:text-white">{record.diagnosis}</p>
                      </div>
                      {record.treatment && (
                        <div>
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Лечение:</span>
                          <p className="text-sm text-gray-900 dark:text-white">{record.treatment}</p>
                        </div>
                      )}
                      {record.medications.length > 0 && (
                        <div>
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Препараты:</span>
                          <p className="text-sm text-gray-900 dark:text-white">{record.medications.join(", ")}</p>
                        </div>
                      )}
                      {record.notes && (
                        <div>
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Заметки:</span>
                          <p className="text-sm text-gray-900 dark:text-white">{record.notes}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Модальное окно добавления записи */}
      {showAddRecord && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Добавить медицинскую запись
                </h3>
                <button
                  onClick={() => setShowAddRecord(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Дата посещения
                  </label>
                  <input
                    type="date"
                    value={newRecord.date}
                    onChange={(e) => setNewRecord({ ...newRecord, date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Врач
                  </label>
                  <input
                    type="text"
                    value={newRecord.doctor}
                    onChange={(e) => setNewRecord({ ...newRecord, doctor: e.target.value })}
                    placeholder="Имя врача"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Специальность
                </label>
                <input
                  type="text"
                  value={newRecord.specialty}
                  onChange={(e) => setNewRecord({ ...newRecord, specialty: e.target.value })}
                  placeholder="Специальность врача"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Диагноз *
                </label>
                <textarea
                  value={newRecord.diagnosis}
                  onChange={(e) => setNewRecord({ ...newRecord, diagnosis: e.target.value })}
                  placeholder="Диагноз или причина обращения"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Лечение
                </label>
                <textarea
                  value={newRecord.treatment}
                  onChange={(e) => setNewRecord({ ...newRecord, treatment: e.target.value })}
                  placeholder="Назначенное лечение"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Препараты
                </label>
                <input
                  type="text"
                  value={newRecord.medications?.join(", ")}
                  onChange={(e) => setNewRecord({ 
                    ...newRecord, 
                    medications: e.target.value.split(",").map(med => med.trim()).filter(med => med) 
                  })}
                  placeholder="Препараты через запятую"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Заметки
                </label>
                <textarea
                  value={newRecord.notes}
                  onChange={(e) => setNewRecord({ ...newRecord, notes: e.target.value })}
                  placeholder="Дополнительные заметки"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
                />
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3">
              <button
                onClick={() => setShowAddRecord(false)}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors duration-200"
              >
                Отмена
              </button>
              <button
                onClick={handleAddRecord}
                disabled={!newRecord.doctor || !newRecord.diagnosis}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition-colors duration-200"
              >
                Добавить
              </button>
            </div>
          </div>
        </div>
      )}
      {activeSection === "vitals" && (
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Показатели здоровья
            </h3>
            {isEditing && (
              <button
                onClick={handleSaveVitals}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors duration-200"
              >
                <Save className="h-4 w-4" />
                <span>Сохранить изменения</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Основные показатели */}
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900 dark:text-white">Основные показатели</h4>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Рост (см)
                  </label>
                  <input
                    type="text"
                    value={vitalSigns.height}
                    onChange={(e) => setVitalSigns({ ...vitalSigns, height: e.target.value })}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-700"
                    placeholder="175"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Вес (кг)
                  </label>
                  <input
                    type="text"
                    value={vitalSigns.weight}
                    onChange={(e) => setVitalSigns({ ...vitalSigns, weight: e.target.value })}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-700"
                    placeholder="70"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Давление
                  </label>
                  <input
                    type="text"
                    value={vitalSigns.bloodPressure}
                    onChange={(e) => setVitalSigns({ ...vitalSigns, bloodPressure: e.target.value })}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-700"
                    placeholder="120/80"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Пульс (уд/мин)
                  </label>
                  <input
                    type="text"
                    value={vitalSigns.heartRate}
                    onChange={(e) => setVitalSigns({ ...vitalSigns, heartRate: e.target.value })}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-700"
                    placeholder="72"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Группа крови
                  </label>
                  <select
                    value={vitalSigns.bloodType}
                    onChange={(e) => setVitalSigns({ ...vitalSigns, bloodType: e.target.value })}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-700"
                  >
                    <option value="">Выберите</option>
                    <option value="O(I) Rh+">O(I) Rh+</option>
                    <option value="O(I) Rh-">O(I) Rh-</option>
                    <option value="A(II) Rh+">A(II) Rh+</option>
                    <option value="A(II) Rh-">A(II) Rh-</option>
                    <option value="B(III) Rh+">B(III) Rh+</option>
                    <option value="B(III) Rh-">B(III) Rh-</option>
                    <option value="AB(IV) Rh+">AB(IV) Rh+</option>
                    <option value="AB(IV) Rh-">AB(IV) Rh-</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Температура (°C)
                  </label>
                  <input
                    type="text"
                    value={vitalSigns.temperature}
                    onChange={(e) => setVitalSigns({ ...vitalSigns, temperature: e.target.value })}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-700"
                    placeholder="36.6"
                  />
                </div>
              </div>
            </div>

            {/* Аллергии */}
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900 dark:text-white">Аллергии</h4>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Лекарственные препараты
                </label>
                <input
                  type="text"
                  value={allergies.medications.join(", ")}
                  onChange={(e) => setAllergies({ 
                    ...allergies, 
                    medications: e.target.value.split(",").map(item => item.trim()).filter(item => item) 
                  })}
                  disabled={!isEditing}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-700"
                  placeholder="Аспирин, Пенициллин"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Пищевые продукты
                </label>
                <input
                  type="text"
                  value={allergies.food.join(", ")}
                  onChange={(e) => setAllergies({ 
                    ...allergies, 
                    food: e.target.value.split(",").map(item => item.trim()).filter(item => item) 
                  })}
                  disabled={!isEditing}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-700"
                  placeholder="Орехи, Молоко"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Экологические факторы
                </label>
                <input
                  type="text"
                  value={allergies.environmental.join(", ")}
                  onChange={(e) => setAllergies({ 
                    ...allergies, 
                    environmental: e.target.value.split(",").map(item => item.trim()).filter(item => item) 
                  })}
                  disabled={!isEditing}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-700"
                  placeholder="Пыльца, Пыль"
                />
              </div>

              {/* Хронические заболевания */}
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <h4 className="font-medium text-gray-900 dark:text-white mb-4">Хронические заболевания</h4>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Заболевания
                  </label>
                  <input
                    type="text"
                    value={chronicConditions.conditions.join(", ")}
                    onChange={(e) => setChronicConditions({ 
                      ...chronicConditions, 
                      conditions: e.target.value.split(",").map(item => item.trim()).filter(item => item) 
                    })}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-700"
                    placeholder="Гипертония, Диабет"
                  />
                </div>

                <div className="mt-3">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Постоянные препараты
                  </label>
                  <input
                    type="text"
                    value={chronicConditions.medications.join(", ")}
                    onChange={(e) => setChronicConditions({ 
                      ...chronicConditions, 
                      medications: e.target.value.split(",").map(item => item.trim()).filter(item => item) 
                    })}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-700"
                    placeholder="Лизиноприл, Метформин"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeSection === "medications" && (
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
            Лекарственные препараты
          </h3>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Текущие препараты */}
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900 dark:text-white">Текущие препараты</h4>
              
              {chronicConditions.medications.length > 0 ? (
                <div className="space-y-3">
                  {chronicConditions.medications.map((medication: string, index: number) => (
                    <div key={index} className="flex items-center space-x-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                      <Pill className="h-4 w-4 text-green-600 dark:text-green-400" />
                      <span className="text-sm font-medium text-green-800 dark:text-green-300">
                        {medication}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  Постоянных препаратов не указано
                </p>
              )}
            </div>

            {/* Аллергии на препараты */}
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900 dark:text-white">Аллергии на препараты</h4>
              
              {allergies.medications.length > 0 ? (
                <div className="space-y-3">
                  {allergies.medications.map((medication: string, index: number) => (
                    <div key={index} className="flex items-center space-x-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                      <X className="h-4 w-4 text-red-600 dark:text-red-400" />
                      <span className="text-sm font-medium text-red-800 dark:text-red-300">
                        {medication}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  Аллергий на препараты не указано
                </p>
              )}
            </div>
          </div>

          {/* История назначений */}
          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            <h4 className="font-medium text-gray-900 dark:text-white mb-4">История назначений</h4>
            
            {medicalRecords.filter(record => record.medications.length > 0).length > 0 ? (
              <div className="space-y-4">
                {medicalRecords
                  .filter(record => record.medications.length > 0)
                  .map((record: MedicalRecord) => (
                    <div key={record.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {new Date(record.date).toLocaleDateString()}
                          </span>
                        </div>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {record.doctor}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {record.medications.map((medication: string, index: number) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 text-xs rounded-full"
                          >
                            {medication}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                История назначений пуста
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
