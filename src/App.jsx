import { useEffect, useState } from 'react'

const storageKey = 'timeliner.timelines.v1'

const initialTimelines = [
  {
    id: 'ua-20',
    title: 'Україна 20 століття',
    region: 'Україна',
    period: '1900-1999',
    color: '#2457c5',
    events: [
      {
        id: 'ua-1',
        date: '1918-01-22',
        title: 'Проголошення незалежності УНР',
        description: 'IV Універсал Центральної Ради проголосив незалежність.',
      },
      {
        id: 'ua-2',
        date: '1932-11-01',
        title: 'Голодомор',
        description: 'Трагедія масового голоду 1932-1933 років.',
      },
      {
        id: 'ua-3',
        date: '1991-08-24',
        title: 'Незалежність України',
        description: 'Верховна Рада ухвалила Акт проголошення незалежності.',
      },
    ],
  },
  {
    id: 'us-20',
    title: 'США 20 століття',
    region: 'США',
    period: '1900-1999',
    color: '#b22234',
    events: [
      {
        id: 'us-1',
        date: '1929-10-24',
        title: 'Крах Волл-стріт',
        description: 'Початок Великої депресії.',
      },
      {
        id: 'us-2',
        date: '1969-07-20',
        title: 'Висадка на Місяць',
        description: 'Apollo 11 доставив людей на поверхню Місяця.',
      },
      {
        id: 'us-3',
        date: '1989-11-09',
        title: 'Кінець холодної війни',
        description: 'Падіння Берлінської стіни стало поворотною точкою епохи.',
      },
    ],
  },
  {
    id: 'eu-modern',
    title: 'Європа після 2000',
    region: 'Європа',
    period: '2000-2025',
    color: '#157347',
    events: [
      {
        id: 'eu-1',
        date: '2002-01-01',
        title: 'Запровадження готівкового євро',
        description: 'Євро увійшов у щоденний обіг у низці країн ЄС.',
      },
    ],
  },
]

const emptyEvent = {
  id: '',
  date: '',
  title: '',
  description: '',
}

const emptyTimeline = {
  title: '',
  region: '',
  period: '',
  color: '#7a4bff',
}

const localizedTimelineById = Object.fromEntries(initialTimelines.map((timeline) => [timeline.id, timeline]))

function localizeSavedTimelines(timelines) {
  return timelines.map((timeline) => {
    const localizedTimeline = localizedTimelineById[timeline.id]
    if (!localizedTimeline) return timeline

    const localizedEventsById = Object.fromEntries(
      localizedTimeline.events.map((event) => [event.id, event]),
    )

    return {
      ...timeline,
      title: localizedTimeline.title,
      region: localizedTimeline.region,
      period: localizedTimeline.period,
      color: timeline.color ?? localizedTimeline.color,
      events: timeline.events.map((event) => {
        const localizedEvent = localizedEventsById[event.id]
        if (!localizedEvent) return event

        return {
          ...event,
          title: localizedEvent.title,
          description: localizedEvent.description,
        }
      }),
    }
  })
}

function loadInitialTimelines() {
  if (typeof window === 'undefined') return initialTimelines
  const saved = window.localStorage.getItem(storageKey)
  if (!saved) return initialTimelines

  try {
    const parsed = JSON.parse(saved)
    return Array.isArray(parsed) && parsed.length > 0
      ? localizeSavedTimelines(parsed)
      : initialTimelines
  } catch {
    return initialTimelines
  }
}

function getPeriodLabel(date) {
  const year = Number(date.slice(0, 4))
  if (!year) return 'Без періоду'
  if (year < 1900) return 'До 1900'
  if (year < 1950) return '1900-1949'
  if (year < 2000) return '1950-1999'
  return '2000-2025'
}

function formatDate(date) {
  if (!date) return 'Без дати'
  const [year, month, day] = date.split('-')
  return `${day}.${month}.${year}`
}

function insertEventByDate(events, nextEvent) {
  return [...events, nextEvent].sort((a, b) => new Date(a.date) - new Date(b.date))
}

function buildTimelineGroups(timelines, selectedIds, periodFilter) {
  const selected = timelines.filter((timeline) => selectedIds.includes(timeline.id))
  const flatEvents = selected.flatMap((timeline) =>
    timeline.events
      .filter((event) => periodFilter === 'Усі' || getPeriodLabel(event.date) === periodFilter)
      .map((event) => ({
        ...event,
        timelineTitle: timeline.title,
        timelineColor: timeline.color,
      })),
  )

  const sorted = flatEvents.sort((a, b) => new Date(a.date) - new Date(b.date))
  const groups = []

  for (const event of sorted) {
    const lastGroup = groups[groups.length - 1]
    if (lastGroup?.date === event.date) {
      lastGroup.events.push(event)
    } else {
      groups.push({ date: event.date, events: [event] })
    }
  }

  return groups
}

function TimelineForm({ value, onChange, onSubmit, submitLabel, onCancel }) {
  return (
    <div className="glass-card p-3 p-lg-4">
      <div className="row g-3">
        <div className="col-12">
          <label className="form-label">Назва</label>
          <input
            className="form-control"
            value={value.title}
            onChange={(event) => onChange((current) => ({ ...current, title: event.target.value }))}
          />
        </div>
        <div className="col-md-6">
          <label className="form-label">Регіон</label>
          <input
            className="form-control"
            value={value.region}
            onChange={(event) => onChange((current) => ({ ...current, region: event.target.value }))}
          />
        </div>
        <div className="col-md-6">
          <label className="form-label">Період</label>
          <input
            className="form-control"
            value={value.period}
            onChange={(event) => onChange((current) => ({ ...current, period: event.target.value }))}
          />
        </div>
        <div className="col-12">
          <label className="form-label">Колір</label>
          <input
            type="color"
            className="form-control form-control-color color-input"
            value={value.color}
            onChange={(event) => onChange((current) => ({ ...current, color: event.target.value }))}
          />
        </div>
        <div className="col-12 d-flex flex-wrap gap-2">
          <button className="btn btn-dark" onClick={onSubmit}>
            {submitLabel}
          </button>
          <button className="btn btn-outline-secondary" onClick={onCancel}>
            Назад
          </button>
        </div>
      </div>
    </div>
  )
}

function EventForm({ value, onChange, onSubmit, submitLabel, onCancel }) {
  return (
    <div className="glass-card p-3 p-lg-4">
      <div className="row g-3">
        <div className="col-md-4">
          <label className="form-label">Дата</label>
          <input
            type="date"
            className="form-control"
            value={value.date}
            onChange={(event) => onChange((current) => ({ ...current, date: event.target.value }))}
          />
        </div>
        <div className="col-md-8">
          <label className="form-label">Назва події</label>
          <input
            className="form-control"
            value={value.title}
            onChange={(event) => onChange((current) => ({ ...current, title: event.target.value }))}
          />
        </div>
        <div className="col-12">
          <label className="form-label">Опис</label>
          <textarea
            rows="4"
            className="form-control"
            value={value.description}
            onChange={(event) =>
              onChange((current) => ({ ...current, description: event.target.value }))
            }
          />
        </div>
        <div className="col-12 d-flex flex-wrap gap-2">
          <button className="btn btn-dark" onClick={onSubmit}>
            {submitLabel}
          </button>
          <button className="btn btn-outline-secondary" onClick={onCancel}>
            Назад
          </button>
        </div>
      </div>
    </div>
  )
}

export default function App() {
  const initialData = loadInitialTimelines()
  const [timelines, setTimelines] = useState(initialData)
  const [activeTimelineId, setActiveTimelineId] = useState(initialData[0].id)
  const [selectedTimelineIds, setSelectedTimelineIds] = useState([initialData[0].id])
  const [page, setPage] = useState('home')
  const [tabSearch, setTabSearch] = useState('')
  const [regionFilter, setRegionFilter] = useState('Усі')
  const [periodFilter, setPeriodFilter] = useState('Усі')
  const [eventFilter, setEventFilter] = useState('Усі')
  const [newTimeline, setNewTimeline] = useState({ ...emptyTimeline })
  const [editingTimeline, setEditingTimeline] = useState({ ...emptyTimeline })
  const [newEvent, setNewEvent] = useState({ ...emptyEvent })
  const [editingEvent, setEditingEvent] = useState({ ...emptyEvent })
  const [confirmDialog, setConfirmDialog] = useState(null)

  useEffect(() => {
    window.localStorage.setItem(storageKey, JSON.stringify(timelines))
  }, [timelines])

  const regions = ['Усі', ...new Set(timelines.map((timeline) => timeline.region))]
  const tabPeriods = ['Усі', ...new Set(timelines.map((timeline) => timeline.period))]
  const eventPeriods = [
    'Усі',
    ...new Set(
      timelines.flatMap((timeline) => timeline.events.map((event) => getPeriodLabel(event.date))),
    ),
  ]

  const visibleTimelines = timelines.filter((timeline) => {
    const matchesSearch = timeline.title.toLowerCase().includes(tabSearch.toLowerCase())
    const matchesRegion = regionFilter === 'Усі' || timeline.region === regionFilter
    const matchesPeriod = periodFilter === 'Усі' || timeline.period === periodFilter
    return matchesSearch && matchesRegion && matchesPeriod
  })

  const activeTimeline =
    timelines.find((timeline) => timeline.id === activeTimelineId) ?? timelines[0] ?? null

  useEffect(() => {
    if (!timelines.some((timeline) => timeline.id === activeTimelineId)) {
      setActiveTimelineId(timelines[0]?.id ?? '')
    }
  }, [activeTimelineId, timelines])

  useEffect(() => {
    setSelectedTimelineIds((current) => {
      const ids = new Set(timelines.map((timeline) => timeline.id))
      const filtered = current.filter((id) => ids.has(id))
      return filtered.length > 0 ? filtered : timelines[0] ? [timelines[0].id] : []
    })
  }, [timelines])

  useEffect(() => {
    if (!eventPeriods.includes(eventFilter)) {
      setEventFilter('Усі')
    }
  }, [eventFilter, eventPeriods])

  const selectedVisibleTimelineIds = selectedTimelineIds.filter((id) =>
    visibleTimelines.some((timeline) => timeline.id === id),
  )
  const timelineGroups = buildTimelineGroups(visibleTimelines, selectedVisibleTimelineIds, eventFilter)

  function updateTimeline(id, updater) {
    setTimelines((current) =>
      current.map((timeline) =>
        timeline.id === id ? { ...timeline, ...updater(timeline) } : timeline,
      ),
    )
  }

  function addTimeline() {
    if (!newTimeline.title.trim() || !newTimeline.region.trim() || !newTimeline.period.trim()) return

    const timeline = {
      id: crypto.randomUUID(),
      title: newTimeline.title.trim(),
      region: newTimeline.region.trim(),
      period: newTimeline.period.trim(),
      color: newTimeline.color,
      events: [],
    }

    setTimelines((current) => [...current, timeline])
    setActiveTimelineId(timeline.id)
    setSelectedTimelineIds((current) => [...new Set([...current, timeline.id])])
    setNewTimeline({ ...emptyTimeline })
    setPage('home')
  }

  function saveTimeline() {
    if (!activeTimeline) return
    if (!editingTimeline.title.trim() || !editingTimeline.region.trim() || !editingTimeline.period.trim()) {
      return
    }

    updateTimeline(activeTimeline.id, () => ({
      title: editingTimeline.title.trim(),
      region: editingTimeline.region.trim(),
      period: editingTimeline.period.trim(),
      color: editingTimeline.color,
    }))
    setPage('home')
  }

  function addEvent() {
    if (!activeTimeline) return
    if (!newEvent.date || !newEvent.title.trim()) return

    updateTimeline(activeTimeline.id, (timeline) => ({
      events: insertEventByDate(timeline.events, {
        id: crypto.randomUUID(),
        date: newEvent.date,
        title: newEvent.title.trim(),
        description: newEvent.description.trim(),
      }),
    }))

    setNewEvent({ ...emptyEvent })
    setPage('home')
  }

  function saveEvent() {
    if (!activeTimeline) return
    if (!editingEvent.id || !editingEvent.date || !editingEvent.title.trim()) return

    updateTimeline(activeTimeline.id, (timeline) => ({
      events: timeline.events
        .map((event) =>
          event.id === editingEvent.id
            ? {
                ...event,
                date: editingEvent.date,
                title: editingEvent.title.trim(),
                description: editingEvent.description.trim(),
              }
            : event,
        )
        .sort((a, b) => new Date(a.date) - new Date(b.date)),
    }))

    setEditingEvent({ ...emptyEvent })
    setPage('edit-timeline')
  }

  function removeEvent(eventId) {
    if (!activeTimeline) return
    updateTimeline(activeTimeline.id, (timeline) => ({
      events: timeline.events.filter((event) => event.id !== eventId),
    }))
  }

  function moveEvent(eventId, direction) {
    if (!activeTimeline) return
    updateTimeline(activeTimeline.id, (timeline) => {
      const fromIndex = timeline.events.findIndex((event) => event.id === eventId)
      const toIndex = fromIndex + direction
      if (fromIndex < 0 || toIndex < 0 || toIndex >= timeline.events.length) {
        return { events: timeline.events }
      }

      const nextEvents = [...timeline.events]
      const [moved] = nextEvents.splice(fromIndex, 1)
      nextEvents.splice(toIndex, 0, moved)
      return { events: nextEvents }
    })
  }

  function toggleTimelineSelection(timelineId) {
    setSelectedTimelineIds((current) => {
      if (current.includes(timelineId)) {
        const next = current.filter((id) => id !== timelineId)
        return next.length > 0 ? next : current
      }
      return [...current, timelineId]
    })
  }

  function openEditPage(timeline) {
    setActiveTimelineId(timeline.id)
    setEditingTimeline({
      title: timeline.title,
      region: timeline.region,
      period: timeline.period,
      color: timeline.color,
    })
    setPage('edit-timeline')
  }

  function openCreateEventPage(timeline) {
    setActiveTimelineId(timeline.id)
    setNewEvent({ ...emptyEvent })
    setPage('new-event')
  }

  function openEditEventPage(timeline, event) {
    setActiveTimelineId(timeline.id)
    setEditingEvent({
      id: event.id,
      date: event.date,
      title: event.title,
      description: event.description,
    })
    setPage('edit-event')
  }

  function openDeleteDialog(payload) {
    setConfirmDialog(payload)
  }

  function closeDeleteDialog() {
    setConfirmDialog(null)
  }

  function confirmDelete() {
    if (!confirmDialog) return

    if (confirmDialog.type === 'timeline') {
      const fallbackTimeline = timelines.find((timeline) => timeline.id !== confirmDialog.timelineId)
      setTimelines((current) => current.filter((timeline) => timeline.id !== confirmDialog.timelineId))
      setSelectedTimelineIds((current) => current.filter((id) => id !== confirmDialog.timelineId))
      if (activeTimelineId === confirmDialog.timelineId) {
        setActiveTimelineId(fallbackTimeline?.id ?? '')
      }
      if (page === 'edit-timeline' || page === 'new-event' || page === 'edit-event') {
        setPage('home')
      }
    }

    if (confirmDialog.type === 'event') {
      removeEvent(confirmDialog.eventId)
      if (page === 'edit-event') {
        setPage('edit-timeline')
      }
    }

    setConfirmDialog(null)
  }

  function resetDemoData() {
    setTimelines(initialTimelines)
    setActiveTimelineId(initialTimelines[0].id)
    setSelectedTimelineIds([initialTimelines[0].id])
    setNewTimeline({ ...emptyTimeline })
    setEditingTimeline({ ...emptyTimeline })
    setNewEvent({ ...emptyEvent })
    setEditingEvent({ ...emptyEvent })
    setEventFilter('Усі')
    setPage('home')
  }

  return (
    <div className="app-shell">
      <div className="hero-panel container-xxl py-4 py-lg-5">
        <div className="row g-4 align-items-start">
          <div className="col-xl-8">
            <div className="eyebrow">Прототип Timeliner</div>
            <h1 className="display-5 fw-semibold text-white mb-3">
              Вертикальний таймлайн з окремими сторінками для форм
            </h1>
            <p className="lead text-white-50 mb-0">
              Праворуч розташований список таймлайнів, а створення та редагування таймлайнів і
              подій відкривається на окремих екранах.
            </p>
          </div>
          <div className="col-xl-4">
            <div className="glass-card p-3 p-lg-4">
              <div className="small text-uppercase text-secondary fw-semibold mb-3">Навігація</div>
              <div className="d-grid gap-2">
                <button className="btn btn-dark" onClick={() => setPage('home')}>
                  Головна
                </button>
                <button className="btn btn-warning" onClick={() => setPage('new-timeline')}>
                  Новий таймлайн
                </button>
                <button
                  className="btn btn-outline-dark"
                  onClick={() => activeTimeline && openEditPage(activeTimeline)}
                  disabled={!activeTimeline}
                >
                  Редагувати активний таб
                </button>
                <button
                  className="btn btn-outline-dark"
                  onClick={() => activeTimeline && openCreateEventPage(activeTimeline)}
                  disabled={!activeTimeline}
                >
                  Нова подія
                </button>
                <button className="btn btn-outline-secondary" onClick={resetDemoData}>
                  Скинути демо
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <main className="container-xxl pb-5">
        {page === 'new-timeline' && (
          <section className="page-panel mx-auto">
            <div className="page-head">
              <h2 className="h3 mb-1">Новий таймлайн</h2>
              <p className="text-secondary mb-0">Створіть окрему вкладку для нової теми.</p>
            </div>
            <TimelineForm
              value={newTimeline}
              onChange={setNewTimeline}
              onSubmit={addTimeline}
              submitLabel="Створити таймлайн"
              onCancel={() => setPage('home')}
            />
          </section>
        )}

        {page === 'edit-timeline' && activeTimeline && (
          <section className="page-panel mx-auto">
            <div className="page-head">
              <h2 className="h3 mb-1">Редагування таба</h2>
              <p className="text-secondary mb-0">
                {activeTimeline.title} • {activeTimeline.region} • {activeTimeline.period}
              </p>
            </div>
            <TimelineForm
              value={editingTimeline}
              onChange={setEditingTimeline}
              onSubmit={saveTimeline}
              submitLabel="Зберегти зміни"
              onCancel={() => setPage('home')}
            />
            <div className="glass-card p-3 p-lg-4 mt-4">
              <div className="d-flex flex-wrap justify-content-between gap-3 mb-3">
                <div>
                  <h3 className="h4 mb-1">Події активного таба</h3>
                  <p className="text-secondary mb-0">
                    Тут можна змінювати порядок подій і видаляти зайві записи.
                  </p>
                </div>
                <button
                  className="btn btn-outline-dark"
                  onClick={() => openCreateEventPage(activeTimeline)}
                >
                  Додати подію
                </button>
              </div>
              <div className="timeline-list compact-list">
                {activeTimeline.events.map((event, index) => (
                  <article key={event.id} className="timeline-card compact-card">
                    <div
                      className="timeline-line"
                      style={{ backgroundColor: activeTimeline.color }}
                    />
                    <div className="timeline-preview">
                      <div className="d-flex flex-wrap justify-content-between align-items-start gap-2">
                        <div className="timeline-date">{formatDate(event.date)}</div>
                        <div className="d-flex flex-wrap gap-2">
                          <button
                            className="icon-button"
                            onClick={() => openEditEventPage(activeTimeline, event)}
                            aria-label={`Редагувати ${event.title}`}
                            title="Редагувати подію"
                          >
                            ✎
                          </button>
                          <button
                            className="icon-button icon-button-plain"
                            disabled={index === 0}
                            onClick={() => moveEvent(event.id, -1)}
                            aria-label="Перемістити вгору"
                            title="Перемістити вгору"
                          >
                            ↑
                          </button>
                          <button
                            className="icon-button icon-button-plain"
                            disabled={index === activeTimeline.events.length - 1}
                            onClick={() => moveEvent(event.id, 1)}
                            aria-label="Перемістити вниз"
                            title="Перемістити вниз"
                          >
                            ↓
                          </button>
                          <button
                            className="icon-button icon-button-plain icon-button-danger"
                            onClick={() =>
                              openDeleteDialog({
                                type: 'event',
                                eventId: event.id,
                              })
                            }
                            aria-label="Видалити"
                            title="Видалити"
                          >
                            🗑
                          </button>
                        </div>
                      </div>
                      <h3 className="h6 mb-1">{event.title}</h3>
                      <p className="text-secondary mb-0">
                        {event.description || 'Опис не заповнено.'}
                      </p>
                    </div>
                    <div className="drag-note mt-3">Порядок усередині активного таба.</div>
                  </article>
                ))}
              </div>
            </div>
          </section>
        )}

        {page === 'edit-event' && activeTimeline && (
          <section className="page-panel mx-auto">
            <div className="page-head">
              <h2 className="h3 mb-1">Редагування події</h2>
              <p className="text-secondary mb-0">Таб {activeTimeline.title}.</p>
            </div>
            <EventForm
              value={editingEvent}
              onChange={setEditingEvent}
              onSubmit={saveEvent}
              submitLabel="Зберегти подію"
              onCancel={() => setPage('edit-timeline')}
            />
          </section>
        )}

        {page === 'new-event' && activeTimeline && (
          <section className="page-panel mx-auto">
            <div className="page-head">
              <h2 className="h3 mb-1">Нова подія</h2>
              <p className="text-secondary mb-0">Подію буде додано в таб {activeTimeline.title}.</p>
            </div>
            <EventForm
              value={newEvent}
              onChange={setNewEvent}
              onSubmit={addEvent}
              submitLabel="Додати подію"
              onCancel={() => setPage('home')}
            />
          </section>
        )}

        {page === 'home' && (
          <>
            {!activeTimeline ? (
              <section className="glass-card p-5 text-center empty-state">
                <h2 className="h4 mb-2">Немає таймлайнів за поточними фільтрами</h2>
                <p className="text-secondary mb-0">
                  Змініть верхні фільтри або створіть новий таймлайн.
                </p>
              </section>
            ) : (
              <section className="row g-4 align-items-start">
                <div className="col-xl-8">
                  <section className="glass-card p-3 p-lg-4 mb-4">
                    <div className="row g-3 align-items-end">
                      <div className="col-lg-4">
                        <label className="form-label">Фільтр табів</label>
                        <input
                          className="form-control"
                          placeholder="Знайти таймлайн"
                          value={tabSearch}
                          onChange={(event) => setTabSearch(event.target.value)}
                        />
                      </div>
                      <div className="col-md-6 col-lg-3">
                        <label className="form-label">Регіон</label>
                        <select
                          className="form-select"
                          value={regionFilter}
                          onChange={(event) => setRegionFilter(event.target.value)}
                        >
                          {regions.map((region) => (
                            <option key={region}>{region}</option>
                          ))}
                        </select>
                      </div>
                      <div className="col-md-6 col-lg-3">
                        <label className="form-label">Період табів</label>
                        <select
                          className="form-select"
                          value={periodFilter}
                          onChange={(event) => setPeriodFilter(event.target.value)}
                        >
                          {tabPeriods.map((period) => (
                            <option key={period}>{period}</option>
                          ))}
                        </select>
                      </div>
                      <div className="col-lg-2">
                        <label className="form-label">Період подій</label>
                        <select
                          className="form-select"
                          value={eventFilter}
                          onChange={(event) => setEventFilter(event.target.value)}
                        >
                          {eventPeriods.map((period) => (
                            <option key={period}>{period}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </section>

                  <section className="glass-card p-3 p-lg-4">
                    <div className="d-flex flex-wrap justify-content-between gap-3 mb-4">
                      <div>
                        <h2 className="h3 mb-1">Зведена стрічка подій</h2>
                        <p className="text-secondary mb-0">
                          Вибрано {selectedVisibleTimelineIds.length} табів, подій:{' '}
                          {timelineGroups.reduce((sum, group) => sum + group.events.length, 0)}
                        </p>
                      </div>
                      <button
                        className="btn btn-outline-dark"
                        onClick={() => openCreateEventPage(activeTimeline)}
                      >
                        Додати подію
                      </button>
                    </div>

                    {timelineGroups.length === 0 ? (
                      <div className="empty-combined">
                        Немає подій для вибраних табів і поточного фільтра періоду.
                      </div>
                    ) : (
                      <ul className="merged-timeline">
                        {timelineGroups.map((group) => (
                          <li
                            key={group.date}
                            className="merged-timeline-item"
                            style={{ '--marker-accent': group.events[0]?.timelineColor ?? '#1d4ed8' }}
                          >
                            <div className="merged-time">
                              <span>{formatDate(group.date)}</span>
                              <small>{getPeriodLabel(group.date)}</small>
                            </div>
                            <div className="merged-marker" />
                            <div className="merged-content">
                              {group.events.map((event) => (
                                <article
                                  key={event.id}
                                  className="merged-event-card"
                                  style={{ '--event-accent': event.timelineColor }}
                                >
                                  <div className="merged-event-head">
                                    <span className="merged-event-tab">{event.timelineTitle}</span>
                                    <span className="merged-event-date">{formatDate(event.date)}</span>
                                  </div>
                                  <h3 className="h5 mb-2">{event.title}</h3>
                                  <p className="text-secondary mb-0">
                                    {event.description || 'Опис не заповнено.'}
                                  </p>
                                </article>
                              ))}
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </section>
                </div>

                <div className="col-xl-4">
                  <aside className="glass-card p-3 p-lg-4 sidebar-panel">
                    <h2 className="h4 mb-3">Таймлайни</h2>
                    <div className="timeline-listing">
                      {visibleTimelines.map((timeline) => {
                        const isSelected = selectedTimelineIds.includes(timeline.id)

                        return (
                          <div
                            key={timeline.id}
                            className={`timeline-list-row ${timeline.id === activeTimeline?.id ? 'is-active' : ''}`}
                            style={{ '--tab-accent': timeline.color }}
                          >
                            <div className="timeline-list-main" onClick={() => setActiveTimelineId(timeline.id)}>
                              <input
                                id={`tab-check-${timeline.id}`}
                                className="form-check-input timeline-list-checkbox"
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => toggleTimelineSelection(timeline.id)}
                                onClick={(event) => event.stopPropagation()}
                              />
                              <div className="timeline-list-copy">
                                <span className="timeline-list-title">{timeline.title}</span>
                                <small>
                                  {timeline.region} • {timeline.period}
                                </small>
                              </div>
                            </div>
                            <div className="timeline-list-actions">
                              <button
                                className="icon-button"
                                onClick={() => openEditPage(timeline)}
                                aria-label={`Редагувати ${timeline.title}`}
                                title="Редагувати"
                              >
                                ✎
                              </button>
                              <button
                                className="icon-button icon-button-danger"
                                onClick={() =>
                                  openDeleteDialog({
                                    type: 'timeline',
                                    timelineId: timeline.id,
                                  })
                                }
                                aria-label={`Видалити ${timeline.title}`}
                                title="Видалити"
                              >
                                🗑
                              </button>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </aside>
                </div>
              </section>
            )}
          </>
        )}
      </main>

      {confirmDialog && (
        <>
          <div className="modal fade show d-block" tabIndex="-1" role="dialog" aria-modal="true">
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Видалити елемент?</h5>
                  <button
                    type="button"
                    className="btn-close"
                    aria-label="Закрити"
                    onClick={closeDeleteDialog}
                  />
                </div>
                <div className="modal-body">
                  <p className="mb-0">Видалити елемент?</p>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-outline-secondary" onClick={closeDeleteDialog}>
                    Скасувати
                  </button>
                  <button type="button" className="btn btn-danger" onClick={confirmDelete}>
                    Видалити
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="modal-backdrop fade show" />
        </>
      )}
    </div>
  )
}
