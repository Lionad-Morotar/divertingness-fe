import Taro, { Component } from '@tarojs/taro'
import { observer, inject } from '@tarojs/mobx'
// eslint-disable-next-line no-unused-vars
import { View, Text, Image } from '@tarojs/components'

import RedDot from '../../../../../components/reddot/index'
import HeadBar from '../../../../../components/headBar/index'
import InfoPad from '../../../../../components/infoPad/index'
import ThreadCard from '../../../../../components/threadCard/index'

import { getRandomPlayData } from '../../../../../comm/play.js'

import './index.less'

import entryIcon from '../../../../../res/homepage/entrys/1.png'
// import roleImage from '../../../../../res/role.png'

@inject('playStore')
@inject('appStore')
@observer
export default class PreparePage extends Component {

  config = {
    navigationStyle: 'custom'
  }
  state = {
    // userinfo: {
    //   name: 'Lionad',
    //   sex: 1,
    //   lever: 7,
    // },
    play: {
      roles: []
    },
    players: [{
      name: 'Lionad',
      sex: 1,
      lever: 7,
    }],
    playerThreads: {

    },
    activeSegment: {},
    isLongDetails: false,
    curThread: [],    // 当前线索(如果找到了线索, 则展示该线索)
    open: {
      threadCard: false,
    }
  }
  store = {
    actions: [
      'segments',
      'threads',
      'open-chat',
      'note'
    ],
    actionNameReflex: {
      'segments': '阶段',
      'threads': '线索',
      'open-chat': '聊天',
      'note': '笔记'
    }
  }

  /** 页面生命周期 & 生命周期相关函数 */

  componentWillMount () {
    this.initData()
  }
  componentDidShow () {}
  setTestData () {
    const { players } = this.state
    const { playStore } = this.props
    const curRoleKey = this.$router.params.role || 'prince'

    playStore.curPlayerRole = curRoleKey
    this.setState({
      players: (
        players[0].role = curRoleKey,
        players
      )
    })
  }

  /** 页面交互逻辑函数 */

  toggleisLongDetails () {
    this.setState({
      isLongDetails: !this.state.isLongDetails
    })
  }

  /** !For Test Only
   *  返回上一个页面
   */
  goLastSegment () {
    const { play, activeSegment } = this.state
    const index = play.segments.findIndex(s => s === activeSegment)

    this.setState({
      activeSegment: play.segments[index - 1 < 0 ? 0 : index - 1]
    })
  }
  goNextSegment () {
    const { play, activeSegment } = this.state
    const index = play.segments.findIndex(s => s === activeSegment)

    this.setState({
      activeSegment: play.segments[
        index < play.segments.length - 1 ? index + 1 : index
      ]
    })
  }

  handleActionClick (action) {
    switch (action) {
      case 'segments':
      break
      case 'threads':
      break
      case 'open-chat':
      break
      case 'note':
      break
    }
  }
  handleActionPress (action) {
    switch (action) {
      case 'threads':
        this.setOpen('threadCard', true)
      break
    }
  }
  setOpen (name, val) {
    const { open } = this.state

    this.setState({
      open: (
        open[name] = val,
        open
      )
    })

    this.setOpenSideEffects(name, val)
  }
  setOpenSideEffects (name, val) {
    const effect = {
      'threadCard-false' () {
        // this.setState({
        //   curThread: []
        // })
      }
    }
    const event = effect[`${name}-${val}`]
    event && event.bind(this)()
  }

  // InfoPad 事件响应
  handleInfoItemAction (info, item) {
    const itemKey = item.key

    switch (info.key) {
      case 'thread':
        const hdlThread = this.postFindThread(itemKey, info)
        hdlThread && this.showAThread(hdlThread)
      break
    }
  }
  showAThread (hdlThread) {
    const { play, playerThreads } = this.state
    const thread = Taro.$utils.deepClone(play.threads[hdlThread.key])
    playerThreads[hdlThread.key] = thread
    this.setState({
      curThread: thread
    }, () => {
      this.setOpen('threadCard', true)
    })
  }

  /** 页面跳转函数 */

  /** 渲染相关函数 */

  render () {
    const { players, activeSegment, curThread, open, playerThreads } = this.state
    const { actionNameReflex } = this.store
    const { appStore } = this.props

    const handleSegmentContent = activeSegment.content || []
    const hasPlayerThreads = Object.keys(playerThreads).length

    return (
      <View className='page with-main-button'>

        <HeadBar title='游戏中' />

        {/* players-con */}
        <View className='players-con fsc' style={{ top: Taro.pxTransform(appStore.headHeight) }}>
          {
            players.map(player => {
              return (
                <View className='player-con fcc-c' key={player.name}>
                  <Image className='role-icon' src={entryIcon} mode='aspectFill' />
                  <View className='role-name'>{player.name}</View>
                </View>
              )
            })
          }
        </View>

        {/* segment info */}
        <View
          className='play-info-con br8 p-r'
        >
          <View className='play-title fsc'>
            <Text>{activeSegment.name}</Text>
          </View>
          {
            activeSegment.intro && (
              <View className='intro-con'>
                <View className='intro'>
                  <Text className='fs22 ls1 c444'>{activeSegment.intro}</Text>
                </View>
              </View>
            )
          }
        </View>

        {/* segment content */}
        <View className='contents-con mt20'>
          <InfoPad
            info={handleSegmentContent}
            onInfoItemAction={this.handleInfoItemAction}
          />
        </View>

        {/* actions segment */}
        <View className='action-segment fsbc'>
          <View className='actions-con f1 fsac'>
            {
              (activeSegment.actions || this.store.actions).map(action => {
                return (
                  <View
                    className='action-con fcc-c'
                    hover-class='action-con-hover'
                    hover-start-time='0'
                    hover-stay-time='260'
                    hover-stop-propagation
                    onClick={this.handleActionClick.bind(this, action)}
                    onLongPress={this.handleActionPress.bind(this, action)}
                    key={action}
                  >
                    {
                      action === 'segments' && <Text className='iconfont'>&#xe620;</Text>
                    }
                    {
                      action === 'threads' && (
                        <RedDot visible={hasPlayerThreads}>
                          <Text className='iconfont'>&#xe618;</Text>
                        </RedDot>
                      )
                    }
                    {
                      action === 'open-chat' && <Text className='iconfont'>&#xe627;</Text>
                    }
                    {
                      action === 'note' && <Text className='iconfont'>&#xe603;</Text>
                    }
                    <Text className='fs22 action-name'>{actionNameReflex[action]}</Text>
                  </View>
                )
              })
            }
          </View>
          <View
            className='next-button fcc'
            onClick={this.goNextSegment}
            onLongPress={this.goLastSegment}
          >
            <Text className='ls3'>下一阶段</Text>
          </View>
        </View>

        <ThreadCard
          visible={open.threadCard}
          thread={curThread}
          onClose={this.setOpen.bind(this, 'threadCard', false)}
        />

      </View>
    )
  }

  /** 业务函数 */

  initData () {
    const play = getRandomPlayData()
    this.setState({
      play,
      activeSegment: play.segments[0]
    }, () => {
      this.setTestData()
    })
  }

  postFindThread (key, info) {
    const { playerThreads } = this.state
    const place = info.data.find(x => x.key === key)
    const unFindThreads = place.data.filter(x => !playerThreads[x.key])

    const hdlThread = Taro.$utils.getRandomItem(unFindThreads)

    return hdlThread ? Taro.$utils.deepClone(hdlThread) : null
  }

}
