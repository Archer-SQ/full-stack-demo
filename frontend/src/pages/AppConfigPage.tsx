import { useMemo, useState } from 'react'
import { Bot, Flame, ListChecks, MessageCircle, Mic, Settings, Volume2 } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { getSettings, updateSetting } from '../api/settings'
import type { AppSetting } from '../api/types'
import GreetingConfigModal from '../components/GreetingConfigModal'
import HotRecommendConfigModal from '../components/HotRecommendConfigModal'
import { useAsyncData } from '../hooks/useAsyncData'
import { toAsyncResult } from '../utils/asyncResult'

type SettingMeta = {
  Icon: LucideIcon
  tone: 'blue' | 'yellow' | 'green' | 'purple' | 'indigo' | 'orange'
  configurable: boolean
}

const settingMetaMap: Record<string, SettingMeta> = {
  greeting: {
    Icon: MessageCircle,
    tone: 'blue',
    configurable: true,
  },
  suggestions: {
    Icon: ListChecks,
    tone: 'yellow',
    configurable: false,
  },
  tts: {
    Icon: Volume2,
    tone: 'green',
    configurable: false,
  },
  stt: {
    Icon: Mic,
    tone: 'purple',
    configurable: false,
  },
  model_config: {
    Icon: Bot,
    tone: 'indigo',
    configurable: true,
  },
  hot_recommend: {
    Icon: Flame,
    tone: 'orange',
    configurable: true,
  },
}

const getStringConfig = (config: AppSetting['config'], key: string, fallback = '') => {
  const value = config[key]

  return typeof value === 'string' ? value : fallback
}

const getNumberConfig = (config: AppSetting['config'], key: string, fallback: number) => {
  const value = config[key]

  return typeof value === 'number' ? value : fallback
}

const getStringArrayConfig = (config: AppSetting['config'], key: string) => {
  const value = config[key]

  return Array.isArray(value) ? value.filter(item => typeof item === 'string') : []
}

const AppConfigPage = () => {
  const {
    data: settings,
    setData: setSettings,
    loading,
    error,
    setError,
  } = useAsyncData(getSettings, [])
  const [updatingCode, setUpdatingCode] = useState<string | null>(null)
  const [activeConfig, setActiveConfig] = useState<AppSetting | null>(null)
  const [greetingText, setGreetingText] = useState('')
  const [greetingQuestions, setGreetingQuestions] = useState<string[]>([])
  const [hotThreshold, setHotThreshold] = useState(3)
  const [savingConfig, setSavingConfig] = useState(false)

  const enabledCount = useMemo(() => {
    return settings.filter(item => item.enabled).length
  }, [settings])

  const handleToggle = async (item: AppSetting) => {
    setUpdatingCode(item.code)
    setError(null)

    const result = await toAsyncResult(
      updateSetting(item.code, {
        enabled: !item.enabled,
        config: item.config,
      })
    )

    if (result.ok) {
      const updated = result.data
      setSettings(currentSettings =>
        currentSettings.map(current => (current.code === updated.code ? updated : current))
      )
    } else if (result.ok === false) {
      setError(result.error)
    }

    setUpdatingCode(null)
  }

  const openConfigModal = (item: AppSetting) => {
    if (item.code !== 'greeting' && item.code !== 'hot_recommend') {
      return
    }

    setActiveConfig(item)
    setError(null)

    if (item.code === 'greeting') {
      setGreetingText(getStringConfig(item.config, 'text'))
      setGreetingQuestions(getStringArrayConfig(item.config, 'questions'))
    }

    if (item.code === 'hot_recommend') {
      setHotThreshold(getNumberConfig(item.config, 'threshold', 3))
    }
  }

  const closeConfigModal = () => {
    if (savingConfig) {
      return
    }

    setActiveConfig(null)
  }

  const updateGreetingQuestion = (index: number, value: string) => {
    setGreetingQuestions(current =>
      current.map((question, questionIndex) => (questionIndex === index ? value : question))
    )
  }

  const addGreetingQuestion = () => {
    setGreetingQuestions(current => {
      if (current.length >= 10) {
        return current
      }

      return [...current, '']
    })
  }

  const removeGreetingQuestion = (index: number) => {
    setGreetingQuestions(current => current.filter((_, questionIndex) => questionIndex !== index))
  }

  const handleSaveConfig = async () => {
    if (!activeConfig || savingConfig) {
      return
    }

    if (activeConfig.code === 'greeting' && !greetingText.trim()) {
      setError('开场白不能为空')
      return
    }

    setSavingConfig(true)
    setError(null)

    const nextConfig =
      activeConfig.code === 'greeting'
        ? {
            ...activeConfig.config,
            text: greetingText.trim(),
            questions: greetingQuestions.map(question => question.trim()).filter(Boolean),
          }
        : {
            ...activeConfig.config,
            threshold: hotThreshold < 1 ? 3 : hotThreshold,
          }

    const result = await toAsyncResult(
      updateSetting(activeConfig.code, {
        enabled: activeConfig.enabled,
        config: nextConfig,
      })
    )

    if (result.ok === false) {
      setError(result.error)
      setSavingConfig(false)
      return
    }

    setSettings(currentSettings =>
      currentSettings.map(current => (current.code === result.data.code ? result.data : current))
    )
    setActiveConfig(null)
    setSavingConfig(false)
  }

  return (
    <main className="app-page">
      <div className="page-shell">
        <nav className="breadcrumb" aria-label="面包屑">
          <span>系统管理</span>
          <span>/</span>
          <strong>应用配置</strong>
        </nav>

        <header className="page-header">
          <div className="title">
            <h1>应用配置</h1>
            <p>管理智能问数相关能力开关。</p>
          </div>
          <div className="summary">
            <span>{enabledCount}</span>
            <small>已开启</small>
          </div>
        </header>

        {loading && <p className="state-text">加载中...</p>}
        {error && <p className="state-text error">{error}</p>}

        {!loading && !error && (
          <section className="settings-grid" aria-label="应用配置列表">
            {settings.map(item => {
              const meta = settingMetaMap[item.code] ?? {
                Icon: Settings,
                tone: 'blue' as const,
                configurable: false,
              }
              const { Icon } = meta

              return (
                <article className="setting-card" key={item.code}>
                  <div className={`setting-icon ${meta.tone}`} aria-hidden="true">
                    <Icon size={22} strokeWidth={2.2} />
                  </div>

                  <div className="setting-content">
                    <div className="setting-title-row">
                      <h2>{item.name}</h2>
                      <div className="setting-actions">
                        {meta.configurable && (
                          <button
                            className="icon-button"
                            type="button"
                            aria-label={`${item.name}配置`}
                            onClick={() => openConfigModal(item)}
                          >
                            <Settings size={18} strokeWidth={2.2} />
                          </button>
                        )}
                        <button
                          className={item.enabled ? 'switch is-on' : 'switch'}
                          type="button"
                          role="switch"
                          aria-checked={item.enabled}
                          disabled={updatingCode === item.code}
                          onClick={() => handleToggle(item)}
                        >
                          <span />
                        </button>
                      </div>
                    </div>
                    <p>{item.description}</p>
                  </div>
                </article>
              )
            })}
          </section>
        )}

        {activeConfig?.code === 'greeting' && (
          <GreetingConfigModal
            text={greetingText}
            questions={greetingQuestions}
            saving={savingConfig}
            onTextChange={setGreetingText}
            onQuestionChange={updateGreetingQuestion}
            onAddQuestion={addGreetingQuestion}
            onRemoveQuestion={removeGreetingQuestion}
            onClose={closeConfigModal}
            onSave={() => void handleSaveConfig()}
          />
        )}

        {activeConfig?.code === 'hot_recommend' && (
          <HotRecommendConfigModal
            threshold={hotThreshold}
            saving={savingConfig}
            onThresholdChange={setHotThreshold}
            onClose={closeConfigModal}
            onSave={() => void handleSaveConfig()}
          />
        )}
      </div>
    </main>
  )
}

export default AppConfigPage
