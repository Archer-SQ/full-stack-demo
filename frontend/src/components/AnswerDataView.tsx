import type { ChatAnswerData } from '../api/types'

type AnswerDataViewProps = {
  answerData: ChatAnswerData
  onSuggestionClick: (suggestion: string) => void
}

const formatCellValue = (value: string | number | undefined) => {
  if (typeof value === 'number') {
    return value.toLocaleString('zh-CN')
  }

  return value ?? '-'
}

const getChartMaxValue = (answerData: ChatAnswerData) => {
  const values = answerData.table.rows.flatMap(row =>
    answerData.chart.series.map(series => Number(row[series.key]) || 0)
  )

  return Math.max(1, ...values)
}

const AnswerDataView = ({ answerData, onSuggestionClick }: AnswerDataViewProps) => {
  const maxValue = getChartMaxValue(answerData)

  return (
    <div className="answer-data">
      <section className="answer-section">
        <h3>数据表格</h3>
        <div className="answer-table-wrap">
          <table className="answer-table">
            <thead>
              <tr>
                {answerData.table.columns.map(column => (
                  <th key={column.key}>{column.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {answerData.table.rows.map((row, rowIndex) => (
                <tr key={`${row.business_unit ?? rowIndex}`}>
                  {answerData.table.columns.map(column => (
                    <td key={column.key}>{formatCellValue(row[column.key])}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="answer-section">
        <h3>数据统计</h3>
        <ul className="answer-stats">
          {answerData.stats.map(stat => (
            <li key={stat.label}>
              <span>{stat.label}</span>
              <strong>{stat.value}</strong>
            </li>
          ))}
        </ul>
      </section>

      <section className="answer-section">
        <h3>数据可视化</h3>
        <p>{answerData.description}</p>

        <div className="mini-chart" aria-label={answerData.chart.title}>
          <strong>{answerData.chart.title}</strong>
          <div className="mini-chart-grid">
            {answerData.table.rows.map((row, rowIndex) => (
              <div className="mini-chart-group" key={`${row.business_unit ?? rowIndex}`}>
                <div className="mini-chart-bars">
                  {answerData.chart.series.map(series => {
                    const value = Number(row[series.key]) || 0
                    const height = Math.max(8, Math.round((value / maxValue) * 104))

                    return (
                      <span
                        key={series.key}
                        title={`${series.name}: ${value.toLocaleString('zh-CN')}`}
                        style={{
                          height,
                          backgroundColor: series.color,
                        }}
                      />
                    )
                  })}
                </div>
                <small>{formatCellValue(row[answerData.chart.x_key])}</small>
              </div>
            ))}
          </div>

          <div className="mini-chart-legend">
            {answerData.chart.series.map(series => (
              <span key={series.key}>
                <i style={{ backgroundColor: series.color }} />
                {series.name}
              </span>
            ))}
          </div>
        </div>
      </section>

      <div className="suggestion-list" aria-label="下一步问题建议">
        {answerData.suggestions.map(suggestion => (
          <button key={suggestion} type="button" onClick={() => onSuggestionClick(suggestion)}>
            {suggestion}
          </button>
        ))}
      </div>
    </div>
  )
}

export default AnswerDataView
