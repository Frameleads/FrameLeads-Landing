'use client';
import {useEffect} from 'react';
import {usePathname} from 'next/navigation';
import {observeMeasurement} from '../measurement';
export default function FirstPartyMeasurement(){const pathname=usePathname();useEffect(()=>{observeMeasurement('PAGE_VIEW');},[pathname]);return null;}
