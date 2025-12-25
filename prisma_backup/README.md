# Prisma Setup

Этот проект использует Prisma с SQLite для работы с базой данных.

## Установка

Пакеты уже установлены:
- `prisma` - CLI для работы с Prisma
- `@prisma/client` - Prisma Client для TypeScript

## Команды

### Генерация Prisma Client
```bash
npm run db:generate
```

### Применение миграций
```bash
npm run db:migrate
```

### Push схемы в базу данных (без миграций)
```bash
npm run db:push
```

### Открыть Prisma Studio (GUI для базы данных)
```bash
npm run db:studio
```

## Структура базы данных

База данных содержит следующие модели:
- **User** - пользователи системы (пациенты, врачи, админы)
- **Doctor** - врачи
- **Appointment** - записи на прием
- **Favorite** - избранные врачи
- **MedicalRecord** - медицинские записи
- **Payment** - платежи

## Использование в коде

```typescript
import { prisma } from '@/lib/prisma'

// Пример использования
const users = await prisma.user.findMany()
const user = await prisma.user.create({
  data: {
    email: 'user@example.com',
    password: 'hashed_password',
  }
})
```

## Переменные окружения

Убедитесь, что в файле `.env` указан `DATABASE_URL`:
```
DATABASE_URL="file:./dev.db"
```

