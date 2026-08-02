import { Component, computed, input } from '@angular/core';
import { Status } from '../../../tasks/models/task';
import { StatusLabelPipe } from '../../../tasks/pipes/status-label.pipe';




export type TaskStatuses = Partial<Record<Status, number | undefined>>;
interface StatusConfig {
  key: string;
  value: number;
  color: string;
  percentage: number;
}
@Component({
  selector: 'app-circle-chart',
  standalone: true,
  imports: [StatusLabelPipe],
  templateUrl: './circle-chart.component.html',
  styleUrl: './circle-chart.component.css'
})
export class CircleChartComponent {
  totals = input.required<TaskStatuses>();
  totalTasks = input.required<number>();

private statusColors: Record<Status | string, string> = {
    [Status.TO_DO]: '#94A3B8',             
    [Status.IN_PROGRESS]: '#003D9B',      
    [Status.BLOCKED]: '#BA1A1A',         
    [Status.IN_REVIEW]: '#F59E0B',       
    [Status.READY_FOR_QA]: '#8B5CF6',     
    [Status.REOPENED]: '#EC4899',          
    [Status.READY_FOR_PRODUCTION]: '#0EA5E9', 
    [Status.DONE]: '#004E32'              
  };

 statusConfigs = computed<StatusConfig[]>(() => {
    const totalsObj = this.totals();
    const total = this.totalTasks();
    
    if (total <= 0 || !totalsObj) return [];

    const configs: StatusConfig[] = [];

    Object.entries(totalsObj).forEach(([key, value]) => {
      const numValue = value || 0;
      if (numValue === 0) return;  // skip

      const percentage = (numValue / total) * 100;
    
      configs.push({
        key: key,
        value: numValue,
        color: this.statusColors[key] || '#CBD5E1', 
        percentage: percentage
      });
    });

    return configs;
  });

  chartGradient = computed(() => {
    const configs = this.statusConfigs();
    if (configs.length === 0) return 'conic-gradient(#e2e8f0 0% 100%)';

    let gradientStops = '';
    let currentStop = 0;

    configs.forEach((config, index) => {
      const start = currentStop;
      const end = currentStop + config.percentage;
      
      gradientStops += `${config.color} ${start}% ${end}%${index === configs.length - 1 ? '' : ','}`;
      currentStop = end;
    });

    return `conic-gradient(${gradientStops})`;
  });
}
