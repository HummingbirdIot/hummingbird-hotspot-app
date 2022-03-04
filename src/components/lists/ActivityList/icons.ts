import { ComponentClass } from 'react'
import add_hotspot from '../../../assets/images/activity/add_hotspot.svg'
import assert_location from '../../../assets/images/activity/assert_location.svg'
import payment_received from '../../../assets/images/activity/payment_received.svg'
import payment_sent from '../../../assets/images/activity/payment_sent.svg'
import payment from '../../../assets/images/activity/payment.svg'
import poc_challengee from '../../../assets/images/activity/poc_challengee.svg'
import poc_challenger from '../../../assets/images/activity/poc_challenger.svg'
import poc_witness_invalid from '../../../assets/images/activity/poc_witness_invalid.svg'
import poc_witness from '../../../assets/images/activity/poc_witness.svg'
import price_oracle from '../../../assets/images/activity/price_oracle.svg'
import received_rewards from '../../../assets/images/activity/received_rewards.svg'
import routing_v1 from '../../../assets/images/activity/routing_v1.svg'
import staked_validator from '../../../assets/images/activity/staked_validator.svg'
import state_channel_close from '../../../assets/images/activity/state_channel_close.svg'
import state_channel_open from '../../../assets/images/activity/state_channel_open.svg'
import token_burn from '../../../assets/images/activity/token_burn.svg'
import transfer_hotspot from '../../../assets/images/activity/transfer_hotspot.svg'
import transferred_stake from '../../../assets/images/activity/transferred_stake.svg'
import unstaked_validator from '../../../assets/images/activity/unstaked_validator.svg'
import validator_heartbeat from '../../../assets/images/activity/validator_heartbeat.svg'

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
