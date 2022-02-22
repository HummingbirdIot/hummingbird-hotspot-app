import { ComponentClass } from 'react'
import add_hotspot from '../../../assets/activity-icons/add_hotspot.svg'
import assert_location from '../../../assets/activity-icons/assert_location.svg'
import payment_received from '../../../assets/activity-icons/payment_received.svg'
import payment_sent from '../../../assets/activity-icons/payment_sent.svg'
import payment from '../../../assets/activity-icons/payment.svg'
import poc_challengee from '../../../assets/activity-icons/poc_challengee.svg'
import poc_challenger from '../../../assets/activity-icons/poc_challenger.svg'
import poc_witness_invalid from '../../../assets/activity-icons/poc_witness_invalid.svg'
import poc_witness from '../../../assets/activity-icons/poc_witness.svg'
import price_oracle from '../../../assets/activity-icons/price_oracle.svg'
import received_rewards from '../../../assets/activity-icons/received_rewards.svg'
import routing_v1 from '../../../assets/activity-icons/routing_v1.svg'
import staked_validator from '../../../assets/activity-icons/staked_validator.svg'
import state_channel_close from '../../../assets/activity-icons/state_channel_close.svg'
import state_channel_open from '../../../assets/activity-icons/state_channel_open.svg'
import token_burn from '../../../assets/activity-icons/token_burn.svg'
import transfer_hotspot from '../../../assets/activity-icons/transfer_hotspot.svg'
import transferred_stake from '../../../assets/activity-icons/transferred_stake.svg'
import unstaked_validator from '../../../assets/activity-icons/unstaked_validator.svg'
import validator_heartbeat from '../../../assets/activity-icons/validator_heartbeat.svg'

export default {
  add_hotspot,
  assert_location,
  payment_received,
  payment_sent,
  payment,
  poc_challengee,
  poc_challenger,
  poc_witness_invalid,
  poc_witness,
  price_oracle,
  received_rewards,
  routing_v1,
  staked_validator,
  state_channel_close,
  state_channel_open,
  token_burn,
  transfer_hotspot,
  transferred_stake,
  unstaked_validator,
  validator_heartbeat,
} as unknown as { [x: string]: ComponentClass }
